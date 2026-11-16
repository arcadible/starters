import { arcadible } from "@arcadible/sdk";
import {
  AmbientLight,
  BoxGeometry,
  DirectionalLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
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
  const { renderer, scene, camera, cube } = createScene(canvas);
  const state = { bounce: 0 };
  let last = 0;

  function frame(time) {
    // In seconds, and at most a tenth, so nothing jumps after a stall.
    const dt = Math.min((time - last) / 1000, 0.1);
    last = time;
    update(state, cube, dt);
    renderer.render(scene, camera);
  }

  greet(player);
  showCount(progress.taps);
  preventBrowserGestures(canvas);
  onTap(canvas, () => tap(state, progress, save));
  fit(renderer, scene, camera);
  new ResizeObserver(() => fit(renderer, scene, camera)).observe(canvas);

  return {
    // fit() has drawn the first frame.
    firstFrame: Promise.resolve(),
    start() {
      last = performance.now();
      renderer.setAnimationLoop(frame);
    },
    stop() {
      renderer.setAnimationLoop(null);
    },
  };
}

function createScene(canvas) {
  const renderer = new WebGLRenderer({ canvas, antialias: true });
  const scene = new Scene();
  const camera = new PerspectiveCamera(50, 1, 0.1, 100);

  const light = new DirectionalLight("white", 3);
  light.position.set(1, 2, 3);
  scene.add(light, new AmbientLight("white", 0.5));

  const cube = new Mesh(
    new BoxGeometry(4, 4, 4),
    new MeshStandardMaterial({ color: "white" }),
  );
  scene.add(cube);

  return { renderer, scene, camera, cube };
}

function tap(state, progress, save) {
  progress.taps += 1;
  state.bounce = 1;
  showCount(progress.taps);
  // Each tap is a checkpoint here; most games save less often, such as at the
  // end of a level, and on every pause.
  save();
}

function update(state, cube, dt) {
  // Turn, and shrink back from a tap's bounce over a quarter of a second.
  cube.rotation.x += dt * 0.5;
  cube.rotation.y += dt;
  state.bounce = Math.max(0, state.bounce - dt * 4);
  cube.scale.setScalar(1 + state.bounce * 0.25);
}

// Render at the screen's resolution, up to 2x, and keep the cube in view on
// a screen that's taller than it is wide.
function fit(renderer, scene, camera) {
  const { clientWidth: width, clientHeight: height } = renderer.domElement;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.position.z = 20 / Math.min(camera.aspect, 1);
  camera.updateProjectionMatrix();
  renderer.render(scene, camera);
}

main();
