import { arcadible } from "@arcadible/sdk";
// Each module is imported from its own path, so the build includes only what
// the game uses: importing from "@babylonjs/core" pulls in all of it.
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { Scene } from "@babylonjs/core/scene";
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
  const { engine, scene, camera, cube } = createScene(canvas);
  const state = { bounce: 0 };

  greet(player);
  showCount(progress.taps);
  preventBrowserGestures(canvas);
  onTap(canvas, () => tap(state, progress, save));
  fit(engine, camera);
  new ResizeObserver(() => fit(engine, camera)).observe(canvas);

  return {
    // Resolves once the first frame is drawn.
    firstFrame: new Promise((resolve) => {
      scene.onAfterRenderObservable.addOnce(() => resolve());
    }),
    start() {
      engine.runRenderLoop(() => {
        // In seconds, and at most a tenth, so nothing jumps after a stall.
        const dt = Math.min(engine.getDeltaTime() / 1000, 0.1);
        update(state, cube, dt);
        scene.render();
      });
    },
    stop() {
      engine.stopRenderLoop();
    },
  };
}

function createScene(canvas) {
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0, 0, 0, 1);

  const camera = new ArcRotateCamera(
    "camera",
    0,
    Math.PI / 2,
    20,
    Vector3.Zero(),
    scene,
  );
  camera.fov = (50 * Math.PI) / 180;
  new HemisphericLight("light", new Vector3(1, 2, 3), scene);

  const cube = CreateBox("cube", { size: 4 }, scene);
  cube.material = new StandardMaterial("white", scene);
  cube.material.diffuseColor = Color3.White();

  return { engine, scene, camera, cube };
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
  cube.scaling.setAll(1 + state.bounce * 0.25);
}

// Render at the screen's resolution, up to 2x, and keep the cube in view on
// a screen that's taller than it is wide.
function fit(engine, camera) {
  engine.setHardwareScalingLevel(1 / Math.min(devicePixelRatio, 2));
  engine.resize();
  camera.radius = 20 / Math.min(engine.getAspectRatio(camera), 1);
}

main();
