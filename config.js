/* ─────────────────────────────────────────────────────────────────────────
   config.js — Survey configuration
   Edit this file to change clip sources, titles, and form field mappings.
   All other JS files read from these constants — don't define them elsewhere.
───────────────────────────────────────────────────────────────────────── */

// ── AUDIO CLIPS ────────────────────────────────────────────────────────────
// title   : displayed on the clip screen
// src     : path to the audio file (relative to index.html)
// formKey : must match the clip title used in submit.js hue lookup
const CLIPS = [
  { title: "Clip One",   src: "audio/clip1.mp3" },
  { title: "Clip Two",   src: "audio/clip2.mp3" },
  { title: "Clip Three", src: "audio/clip3.mp3" },
];

// ── GOOGLE FORM ────────────────────────────────────────────────────────────
// The formResponse endpoint for your Google Form.
// Replace YOUR_FORM_ID with the ID from your form's share URL.
const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLSfsRr_CfGYx-akfRyWqQ4SN5UyWh9Jz9uzBKn1mEtmuuAHI0w/formResponse";

// ── FORM FIELD ENTRY IDs ───────────────────────────────────────────────────
// Map each data point to its Google Form entry ID.
// To find entry IDs: open the live form, F12 → Console →
//   document.querySelectorAll('input[name^="entry"]').forEach(i => console.log(i.name))
//
// IMPORTANT: hue fields are keyed by clip TITLE (not position)
// so randomised order still lands in the correct column.
const FORM_FIELDS = {
  // Hue responses — keyed by clip title
  hue: {
    "Clip One":   "entry.401580039",
    "Clip Two":   "entry.1442421221",
    "Clip Three": "entry.559325467",
  },

  // Preliminary — add entry IDs here once you've added these fields to the form
  age:              "", // e.g. "entry.000000001"
  gender:           "",
  vision:           "",
  hearing:          "",
  formalTraining:   "",
  selfTaught:       "",
  performance:      "",
  audioOutput:      "",

  // Baseline mood
  baselineValence:  "",
  baselineArousal:  "",
  baselineAnxiety:  "",
  baselineFocus:    "",
};
