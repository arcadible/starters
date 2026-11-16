// The page around the game, the same in every starter: the greeting and the
// count over the canvas, taps, and the browser's own gestures turned off.

export function greet(player) {
  const greeting = document.getElementById("greeting");
  if (player?.name) greeting.textContent = `Hi, ${player.name}!`;
  else if (player?.guest) greeting.textContent = "Hi, guest!";
  else greeting.textContent = "Hi there!";
}

export function showCount(taps) {
  const count = document.getElementById("count");
  if (taps === 0) count.textContent = "Tap anywhere";
  else if (taps === 1) count.textContent = "1 tap";
  else count.textContent = `${taps} taps`;
}

// Calls `tap` on a click, a touch, or Space.
export function onTap(canvas, tap) {
  canvas.addEventListener("pointerdown", tap);
  addEventListener("keydown", (event) => {
    if (event.code !== "Space") return;
    event.preventDefault();
    if (!event.repeat) tap();
  });
}

export function preventBrowserGestures(canvas) {
  // No context menu on a right-click or a long press.
  addEventListener("contextmenu", (event) => event.preventDefault());
  // Stop iOS Safari from magnifying the page on a held second tap.
  canvas.addEventListener("touchstart", (event) => event.preventDefault(), {
    passive: false,
  });
}
