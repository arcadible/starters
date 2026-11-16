// The Arcadible SDK is loaded by index.html as the global `arcadible`.
// Docs: https://developer.arcadible.com/references/arcadible-sdk

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
  const ctx = canvas.getContext("2d");
  const state = { angle: 0, bounce: 0 };
  let last = 0;
  let frameId = 0;

  function frame(time) {
    // In seconds, and at most a tenth, so nothing jumps after a stall.
    const dt = Math.min((time - last) / 1000, 0.1);
    last = time;
    update(state, dt);
    draw(ctx, state);
    frameId = requestAnimationFrame(frame);
  }

  greet(player);
  showCount(progress.taps);
  preventBrowserGestures(canvas);
  onTap(canvas, () => tap(state, progress, save));
  fit(ctx, state);
  new ResizeObserver(() => fit(ctx, state)).observe(canvas);

  return {
    // fit() has drawn the first frame.
    firstFrame: Promise.resolve(),
    start() {
      last = performance.now();
      frameId = requestAnimationFrame(frame);
    },
    stop() {
      cancelAnimationFrame(frameId);
    },
  };
}

function tap(state, progress, save) {
  progress.taps += 1;
  state.bounce = 1;
  showCount(progress.taps);
  // Each tap is a checkpoint here; most games save less often, such as at the
  // end of a level, and on every pause.
  save();
}

function update(state, dt) {
  // Turn, and shrink back from a tap's bounce over a quarter of a second.
  state.angle += dt;
  state.bounce = Math.max(0, state.bounce - dt * 4);
}

// A square in the middle, a quarter of the screen's shorter side.
function draw(ctx, state) {
  const { width, height } = ctx.canvas;
  const size = (Math.min(width, height) / 4) * (1 + state.bounce * 0.25);
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(state.angle);
  ctx.fillStyle = "white";
  ctx.fillRect(-size / 2, -size / 2, size, size);
  ctx.restore();
}

// Render at the screen's resolution, up to 2x.
function fit(ctx, state) {
  const { canvas } = ctx;
  const ratio = Math.min(devicePixelRatio, 2);
  canvas.width = Math.round(canvas.clientWidth * ratio);
  canvas.height = Math.round(canvas.clientHeight * ratio);
  draw(ctx, state);
}

main();
