import { arcadible } from "@arcadible/sdk";
import { Application, Graphics } from "pixi.js";
import { greet, onTap, preventBrowserGestures, showCount } from "./page.js";

// --- Arcadible ---------------------------------------------------------------

async function main() {
  // Keep Arcadible's loading screen up until the first frame is drawn.
  // https://developer.arcadible.com/build/initialization
  await arcadible.initStart();

  // Load the player's progress, which carries over to every new version.
  // A failed read isn't a missing save: play on, but don't save over it.
  // A save from an older version takes what's new from newProgress().
  // https://developer.arcadible.com/build/saves
  const { saved, canSave } = await loadProgress();
  const progress = { ...newProgress(), ...saved };
  function save() {
    if (canSave) return saveProgress(progress);
  }

  // Who's playing: a player, a guest, or no one off Arcadible.
  // https://developer.arcadible.com/build/players
  const player = arcadible.players.primary;

  const game = await createGame({ player, progress, save });

  // Arcadible pauses the game when it's hidden, covered, or closing.
  // Stop the game and save; carry on when it resumes.
  // https://developer.arcadible.com/build/pausing
  arcadible.on("pause", () => {
    game.stop();
    return save();
  });
  arcadible.on("resume", () => game.start());

  game.start();
  await game.firstFrame;
  await arcadible.initComplete();
}

async function loadProgress() {
  try {
    const saved = await arcadible.saves.read("progress");
    return { saved: saved ? JSON.parse(saved) : null, canSave: true };
  } catch (error) {
    console.error(error);
    return { saved: null, canSave: false };
  }
}

function saveProgress(progress) {
  return arcadible.saves
    .write("progress", JSON.stringify(progress))
    .catch(console.error);
}

// --- Your game: replace from here --------------------------------------------

// What a new player starts with, and what's saved.
function newProgress() {
  return { taps: 0 };
}

// Builds the game, loading what it needs behind the loading screen, and
// returns how Arcadible's part starts and stops it.
async function createGame({ player, progress, save }) {
  const canvas = document.getElementById("game");
  const { app, square } = await createScene(canvas);
  const state = { bounce: 0, size: 1 };

  greet(player);
  showCount(progress.taps);
  preventBrowserGestures(canvas);
  onTap(canvas, () => tap(state, progress, save));
  fit(state, square, app.screen.width, app.screen.height);
  app.renderer.on("resize", (width, height) =>
    fit(state, square, width, height),
  );
  app.ticker.add((ticker) => {
    // In seconds, and at most a tenth, so nothing jumps after a stall.
    const dt = Math.min(ticker.deltaMS / 1000, 0.1);
    update(state, square, dt);
  });
  app.render();

  return {
    // app.render() has drawn the first frame.
    firstFrame: Promise.resolve(),
    start() {
      app.start();
    },
    stop() {
      app.stop();
    },
  };
}

// Render at the screen's resolution, up to 2x, at the canvas's size.
async function createScene(canvas) {
  const app = new Application();
  await app.init({
    canvas,
    antialias: true,
    autoStart: false,
    background: "black",
    resizeTo: canvas,
    resolution: Math.min(devicePixelRatio, 2),
  });

  const square = new Graphics().rect(-50, -50, 100, 100).fill("white");
  app.stage.addChild(square);

  return { app, square };
}

function tap(state, progress, save) {
  progress.taps += 1;
  state.bounce = 1;
  showCount(progress.taps);
  // Each tap is a checkpoint here; most games save less often, such as at the
  // end of a level, and on every pause.
  save();
}

function update(state, square, dt) {
  // Turn, and shrink back from a tap's bounce over a quarter of a second.
  square.rotation += dt;
  state.bounce = Math.max(0, state.bounce - dt * 4);
  square.scale.set(state.size * (1 + state.bounce * 0.25));
}

// Keep the square centered, a quarter of the screen's shorter side.
function fit(state, square, width, height) {
  square.position.set(width / 2, height / 2);
  state.size = Math.min(width, height) / 400;
  square.scale.set(state.size);
}

main();
