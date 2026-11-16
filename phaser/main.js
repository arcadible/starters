import { arcadible } from "@arcadible/sdk";
import * as Phaser from "phaser";
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
  const state = { bounce: 0, size: 1, square: null };
  const game = createScene(canvas, state);

  greet(player);
  showCount(progress.taps);
  preventBrowserGestures(canvas);
  onTap(canvas, () => tap(state, progress, save));
  // Phaser sets the canvas's size itself, so watch the page instead.
  new ResizeObserver(() => fit(game, state)).observe(document.body);

  return {
    // Phaser starts itself, and draws its first frame once it has.
    firstFrame: new Promise((resolve) => {
      game.events.once("postrender", () => resolve());
    }),
    start() {
      if (game.isPaused) game.resume();
    },
    stop() {
      game.pause();
    },
  };
}

// Phaser draws at the canvas's size, so the game is sized in device pixels
// and zoomed out to fit, which keeps it sharp on high-density screens.
function createScene(canvas, state) {
  class Main extends Phaser.Scene {
    create() {
      state.square = this.add.rectangle(0, 0, 1, 1, 0xffffff);
      fit(this.game, state);
    }

    update(time, delta) {
      // In seconds, and at most a tenth, so nothing jumps after a stall.
      const dt = Math.min(delta / 1000, 0.1);
      update(state, state.square, dt);
    }
  }

  return new Phaser.Game({
    type: Phaser.WEBGL,
    canvas,
    backgroundColor: "#000000",
    scale: { mode: Phaser.Scale.NONE, width: 1, height: 1 },
    scene: Main,
  });
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
  square.setScale(state.size * (1 + state.bounce * 0.25));
}

// Render at the screen's resolution, up to 2x, and keep the square centered,
// a quarter of the screen's shorter side.
function fit(game, state) {
  const ratio = Math.min(devicePixelRatio, 2);
  const width = Math.round(document.body.clientWidth * ratio);
  const height = Math.round(document.body.clientHeight * ratio);
  game.scale.resize(width, height);
  game.scale.setZoom(1 / ratio);
  state.size = Math.min(width, height) / 4;
  state.square?.setPosition(width / 2, height / 2);
}

main();
