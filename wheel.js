/* ─────────────────────────────────────────────────────────────────────────
   wheel.js — Hue wheel
   Handles: drawing the colour wheel on a canvas, picking a hue by click
   or drag, and locking/unlocking the wheel based on audio state.
   Depends on: player.js (hasSelected, checkCanProceed)
───────────────────────────────────────────────────────────────────────── */

// ── STATE ──────────────────────────────────────────────────────────────────
let selectedHue = null;  // integer 0–360, null until user picks
let hasSelected = false; // gates the Next button alongside audioEnded

// ── CANVAS SETUP ───────────────────────────────────────────────────────────
const canvas = document.getElementById("hue-canvas");
const ctx    = canvas.getContext("2d");
const cursor = document.getElementById("hue-cursor");
const SIZE   = 200; // canvas width/height in px

// ── DRAW WHEEL ─────────────────────────────────────────────────────────────
// Renders a full HSL hue wheel as thin radial wedges with a white centre.
// Called once on page load — wheel is static, only the cursor moves.
(function drawWheel() {
  const cx = SIZE / 2, cy = SIZE / 2, r = SIZE / 2;

  for (let a = 0; a < 360; a += 0.5) {
    // Each wedge fades from white (centre) to full saturation (edge)
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, `hsl(${a}, 0%, 100%)`);
    grad.addColorStop(1, `hsl(${a}, 100%, 50%)`);

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, (a - 1) * Math.PI / 180, (a + 1) * Math.PI / 180);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // Dark vignette over the centre to make the white core less harsh
  const dark = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  dark.addColorStop(0.00, "rgba(0,0,0,0.45)");
  dark.addColorStop(0.25, "rgba(0,0,0,0.00)");
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.fillStyle = dark;
  ctx.fill();
})();

// ── LOCK / UNLOCK ──────────────────────────────────────────────────────────
// Toggled by player.js — wheel is locked until audio has finished.
function lockPicker(locked) {
  document.getElementById("wheel-wrap").classList.toggle("picker-locked", locked);
  document.getElementById("locked-msg").style.display = locked ? "block" : "none";
}

// ── COLOUR PICKING ─────────────────────────────────────────────────────────
// Handles click, drag (mousemove with button held), and touch.
// Derives hue from the angle of the click position relative to the centre —
// no pixel sampling needed, which keeps it accurate and fast.
function pickColour(e) {
  if (document.getElementById("wheel-wrap").classList.contains("picker-locked")) return;

  const rect    = canvas.getBoundingClientRect();
  const scaleX  = SIZE / rect.width;
  const scaleY  = SIZE / rect.height;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  // Convert to canvas coordinate space
  const x = (clientX - rect.left) * scaleX;
  const y = (clientY - rect.top)  * scaleY;

  // Ignore clicks outside the circle
  const cx = SIZE / 2, cy = SIZE / 2, r = SIZE / 2;
  if ((x - cx) ** 2 + (y - cy) ** 2 > r * r) return;

  // Move cursor indicator (in CSS px relative to the canvas element)
  cursor.style.left    = (clientX - rect.left) + "px";
  cursor.style.top     = (clientY - rect.top)  + "px";
  cursor.style.display = "block";

  // Derive hue from angle (atan2 gives -180 to 180, normalise to 0–360)
  const angle = Math.atan2(y - cy, x - cx) * 180 / Math.PI;
  selectedHue = Math.round((angle + 360) % 360);
  hasSelected = true;

  // Update cursor colour, swatch, and text readout
  const hueColor = `hsl(${selectedHue}, 90%, 55%)`;
  cursor.style.background = hueColor;
  document.getElementById("swatch").style.background  = hueColor;
  document.getElementById("swatch").style.display     = "block";
  document.getElementById("colour-value").textContent = `Hue ${selectedHue}°`;

  checkCanProceed();
}

// ── EVENT LISTENERS ────────────────────────────────────────────────────────
canvas.addEventListener("click",     pickColour);
canvas.addEventListener("mousemove", e => { if (e.buttons === 1) pickColour(e); });
canvas.addEventListener("touchmove", e => { e.preventDefault(); pickColour(e); }, { passive: false });
