/* ─────────────────────────────────────────────────────────────────────────
   submit.js — Form submission
   Builds a hidden form and posts all collected data to Google Forms
   via a hidden iframe so the page never navigates away.

   Data submitted:
     - Hue responses (keyed by clip title, not position)
     - Preliminary: age, gender, vision, hearing, training, audio output
     - Baseline mood Likert scores

   Depends on: config.js (FORM_URL, FORM_FIELDS, CLIPS),
               survey.js (preliminary, answers)
───────────────────────────────────────────────────────────────────────── */

function submitToForm() {
  const statusEl = document.getElementById("status-msg");
  statusEl.textContent = "Saving…";
  statusEl.classList.add("visible");

  // Hidden iframe absorbs the Google Form response page —
  // without this the form submission would navigate the user away.
  const iframe = document.createElement("iframe");
  iframe.name  = "submit-target";
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  const form    = document.createElement("form");
  form.method   = "POST";
  form.action   = FORM_URL;
  form.target   = "submit-target";

  // Helper: add a hidden input field to the form
  function addField(entryId, value) {
    // Skip fields that haven't been mapped yet in config.js
    if (!entryId) return;
    const input   = document.createElement("input");
    input.type    = "hidden";
    input.name    = entryId;
    input.value   = value ?? "";
    form.appendChild(input);
  }

  // ── Hue responses ────────────────────────────────────────────────────────
  // Look up each clip's hue by title so randomised order doesn't matter.
  CLIPS.forEach(clip => {
    const entryId = FORM_FIELDS.hue[clip.title];
    const hue     = answers[clip.title];
    addField(entryId, hue);
  });

  // ── Preliminary data ─────────────────────────────────────────────────────
  addField(FORM_FIELDS.age,            preliminary.age);
  addField(FORM_FIELDS.gender,         preliminary.gender);
  addField(FORM_FIELDS.vision,         preliminary.vision);
  addField(FORM_FIELDS.hearing,        preliminary.hearing);
  addField(FORM_FIELDS.formalTraining, preliminary.formal);
  addField(FORM_FIELDS.selfTaught,     preliminary.selfTaught);
  addField(FORM_FIELDS.performance,    preliminary.performance);
  addField(FORM_FIELDS.audioOutput,    preliminary.audioOutput);

  // ── Baseline mood ─────────────────────────────────────────────────────────
  addField(FORM_FIELDS.baselineValence, preliminary.baselineValence);
  addField(FORM_FIELDS.baselineArousal, preliminary.baselineArousal);
  addField(FORM_FIELDS.baselineAnxiety, preliminary.baselineAnxiety);
  addField(FORM_FIELDS.baselineFocus,   preliminary.baselineFocus);

  document.body.appendChild(form);
  form.submit();

  // Show confirmation after a short delay.
  // We can't read the iframe response due to cross-origin restrictions,
  // so we optimistically confirm after 1.5s.
  setTimeout(() => {
    statusEl.textContent = "Saved ✓";
  }, 1500);
}
