/* ─────────────────────────────────────────────────────────────────────────
   player.js — Audio player
   Handles: clip loading, play/pause, progress bar, waveform animation,
   and unlocking the hue wheel when a clip finishes.
   Depends on: config.js (CLIPS), survey.js (answers, showScreen),
               wheel.js (lockPicker), submit.js (submitToForm)
───────────────────────────────────────────────────────────────────────── */

// ── STATE ──────────────────────────────────────────────────────────────────
let currentClip = 0;  // index into the (possibly shuffled) CLIPS array
let audioEnded  = false;

const audio = document.getElementById("audio-el");

// ── CLIP LOADING ───────────────────────────────────────────────────────────
// Resets the entire clip screen (label, title, dots, player, wheel)
// and loads the audio for the given index.
function loadClip(index) {
  currentClip = index;
  audioEnded  = false;

  // Update clip label and title
  document.getElementById("clip-label").textContent = `Clip ${index + 1} of ${CLIPS.length}`;
  document.getElementById("clip-title").textContent = CLIPS[index].title;

  // Update next button label
  document.getElementById("next-btn").disabled      = true;
  document.getElementById("next-label").textContent =
    index === CLIPS.length - 1 ? "Finish →" : "Next clip →";

  // Update step progress dots
  [0, 1, 2].forEach(i => {
    document.getElementById(`dot-${i}`).className =
      "step-dot" + (i < index ? " done" : i === index ? " active" : "");
  });

  // Reset hue wheel to locked state
  lockPicker(true);
  document.getElementById("swatch").style.display       = "none";
  document.getElementById("colour-value").textContent   = "";
  document.getElementById("hue-cursor").style.display   = "none";

  // Reset player UI
  audio.src = CLIPS[index].src;
  audio.load();
  updatePlayIcon(false);
  document.getElementById("progress-fill").style.width  = "0%";
  document.getElementById("time-display").textContent   = "0:00";

  buildWaveform();
}

// ── WAVEFORM ───────────────────────────────────────────────────────────────
// Generates 60 random-height bars as a decorative visualiser.
// Bars fill in white as the track plays (driven by timeupdate).
function buildWaveform() {
  const wv = document.getElementById("waveform");
  wv.innerHTML = "";
  for (let i = 0; i < 60; i++) {
    const bar = document.createElement("div");
    bar.className    = "waveform-bar";
    bar.style.height = (8 + Math.random() * 88) + "%";
    wv.appendChild(bar);
  }
}

// ── PLAYBACK CONTROLS ──────────────────────────────────────────────────────
function togglePlay() {
  audio.paused ? audio.play().catch(() => {}) : audio.pause();
}

function updatePlayIcon(playing) {
  document.getElementById("play-icon").innerHTML = playing
    ? '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'
    : '<polygon points="5,3 19,12 5,21"/>';
}

// ── AUDIO EVENT LISTENERS ──────────────────────────────────────────────────
audio.addEventListener("play",  () => updatePlayIcon(true));
audio.addEventListener("pause", () => updatePlayIcon(false));

// Update progress bar and waveform fill on each time tick
audio.addEventListener("timeupdate", () => {
  const dur = audio.duration || 0;
  const pct = dur ? (audio.currentTime / dur) * 100 : 0;

  document.getElementById("progress-fill").style.width = pct + "%";

  // Fill waveform bars proportionally to playback position
  const bars   = document.querySelectorAll(".waveform-bar");
  const played = Math.floor((pct / 100) * bars.length);
  bars.forEach((b, i) => b.classList.toggle("played", i < played));

  // Update timestamp display
  const s = Math.floor(audio.currentTime);
  document.getElementById("time-display").textContent =
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
});

// Unlock the hue wheel once the clip has played through fully
audio.addEventListener("ended", () => {
  updatePlayIcon(false);
  audioEnded = true;
  lockPicker(false);
  checkCanProceed();
});

// ── PROCEED LOGIC ──────────────────────────────────────────────────────────
// Next button only enables once both audio has ended AND a hue is selected.
function checkCanProceed() {
  document.getElementById("next-btn").disabled = !(audioEnded && hasSelected);
}

// Called by the Next / Finish button
function nextClip() {
  // Store hue answer keyed by clip title (safe for randomised order)
  answers[CLIPS[currentClip].title] = selectedHue;
  audio.pause();

  if (currentClip < CLIPS.length - 1) {
    loadClip(currentClip + 1);
  } else {
    showScreen("screen-done");
    submitToForm();
  }
}
