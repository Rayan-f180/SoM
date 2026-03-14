/* ─────────────────────────────────────────────────────────────────────────
   survey.js — Survey flow logic
   Handles: screen transitions, About You validation, mindfulness timer,
   baseline mood collection, and clip randomisation.
   Depends on: config.js (CLIPS), player.js (loadClip)
───────────────────────────────────────────────────────────────────────── */

// ── SHARED STATE ───────────────────────────────────────────────────────────
// preliminary holds all data collected before the clips start.
// answers holds hue responses keyed by clip title for safe randomised lookup.
const preliminary = {};
const answers = {}; // { "Clip One": 120, "Clip Two": 45, ... }

// ── SCREEN TRANSITIONS ─────────────────────────────────────────────────────
// Removes .active from all screens then adds it to the target,
// re-triggering the fadeUp animation via a forced reflow.
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const el = document.getElementById(id);
  el.classList.remove("active");
  void el.offsetWidth; // force reflow so animation restarts
  el.classList.add("active");
}

// ── WELCOME → ABOUT YOU ────────────────────────────────────────────────────
function startSurvey() {
  showScreen("screen-about");
}

// ── ABOUT YOU VALIDATION & SUBMISSION ─────────────────────────────────────
// Validates all required fields, stores values in preliminary{},
// then advances to the mindfulness screen.
function submitAbout() {
  let valid = true;

  // Helper: show/hide an error element and update valid flag
  function check(condition, errorId) {
    const el = document.getElementById(errorId);
    if (!condition) { el.classList.add("visible");    valid = false; }
    else              el.classList.remove("visible");
  }

  const age         = document.getElementById("age").value;
  const gender      = document.querySelector('input[name="gender"]:checked');
  const vision      = document.querySelector('input[name="vision"]:checked');
  const hearing     = document.querySelector('input[name="hearing"]:checked');
  const formal      = document.querySelector('input[name="formal"]:checked');
  const performance = document.querySelector('input[name="performance"]:checked');
  const audioOut    = document.querySelector('input[name="audio-output"]:checked');
  const nightshift  = document.getElementById("check-nightshift").checked;
  const brightness  = document.getElementById("check-brightness").checked;

  check(age && age >= 18,  "err-age");
  check(gender,            "err-gender");
  check(vision,            "err-vision");
  check(hearing,           "err-hearing");
  check(formal,            "err-formal");
  check(performance,       "err-performance");
  check(audioOut,          "err-audio");
  check(nightshift && brightness, "err-checks");

  if (!valid) return;

  // Store all preliminary values
  preliminary.age         = age;
  preliminary.gender      = gender.value === "Self-description"
    ? (document.getElementById("gender-other").value || "Self-description")
    : gender.value;
  preliminary.vision      = vision.value;
  preliminary.hearing     = hearing.value;
  preliminary.formal      = formal.value;
  preliminary.selfTaught  = document.querySelector('input[name="selftaught"]:checked')?.value || "N/A";
  preliminary.performance = performance.value;
  preliminary.audioOutput = audioOut.value;

  showScreen("screen-mindfulness");
  startMindfulness();
}

// ── MINDFULNESS TIMER ──────────────────────────────────────────────────────
// Counts down 30 seconds with an SVG circle progress indicator.
// Auto-advances to the baseline mood screen on completion.
function startMindfulness() {
  const DURATION      = 30;
  const CIRCUMFERENCE = 339.3; // 2π × r (r=54)
  const prog          = document.getElementById("timer-progress");
  const num           = document.getElementById("timer-number");
  let remaining       = DURATION;

  prog.style.strokeDashoffset = "0";

  const tick = setInterval(() => {
    remaining--;
    num.textContent = remaining;

    // Advance the circle stroke proportionally
    prog.style.strokeDashoffset =
      ((DURATION - remaining) / DURATION * CIRCUMFERENCE).toString();

    if (remaining <= 0) {
      clearInterval(tick);
      showScreen("screen-baseline");
    }
  }, 1000);
}

// ── BASELINE MOOD ──────────────────────────────────────────────────────────
// Validates all 4 Likert scales, stores values in preliminary{},
// shuffles clip order, then starts the first clip.
function submitBaseline() {
  const scales = ["b-valence", "b-arousal", "b-anxiety", "b-focus"];
  const values = scales.map(name =>
    document.querySelector(`input[name="${name}"]:checked`)?.value
  );
  const errEl = document.getElementById("err-baseline");

  if (values.some(v => !v)) {
    errEl.classList.add("visible");
    return;
  }
  errEl.classList.remove("visible");

  preliminary.baselineValence = values[0];
  preliminary.baselineArousal = values[1];
  preliminary.baselineAnxiety = values[2];
  preliminary.baselineFocus   = values[3];

  // Randomise clip order to remove order effects.
  // Answers are stored by clip title (not index) so the sheet
  // columns stay correct regardless of play order.
  CLIPS.sort(() => Math.random() - 0.5);

  showScreen("screen-clip");
  loadClip(0);
}
