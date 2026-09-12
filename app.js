/**
 * app.js — screens, the run state machine, and the tap/long-press gesture.
 *
 * The app has exactly four screens and one piece of live state: the run in
 * progress. Everything else is settings (persisted) or derived at render time.
 */
(() => {
  "use strict";

  const LONG_PRESS_MS = 450;

  const el = (id) => document.getElementById(id);

  const screens = {
    home: el("screen-home"),
    card: el("screen-card"),
    summary: el("screen-summary"),
    settings: el("screen-settings"),
  };

  /** The run in progress, or null between runs. */
  let run = null;

  function show(name) {
    for (const [key, node] of Object.entries(screens)) node.hidden = key !== name;
  }

  const formatSeconds = (ms) => `${(ms / 1000).toFixed(1)}s`;

  // --- The run ------------------------------------------------------------

  function startRun() {
    const { cardCount } = Settings.get();
    run = {
      endless: cardCount === 0,
      cards: Deck.deal(PROMPTS, cardCount),
      index: 0,
      results: [],
      shownAt: 0,
    };
    show("card");
    presentCard();
  }

  function presentCard() {
    // Endless mode reshuffles rather than stopping, so the deck cycles without
    // ever repeating within a pass.
    if (run.index >= run.cards.length) {
      if (!run.endless) return endRun();
      run.cards = Deck.deal(PROMPTS, 0);
      run.index = 0;
    }

    const prompt = el("prompt");
    prompt.textContent = run.cards[run.index];
    el("progress").textContent = run.endless
      ? `${run.results.length + 1}`
      : `${run.index + 1} / ${run.cards.length}`;

    // Re-trigger the entrance animation on a node already in the DOM.
    prompt.style.animation = "none";
    void prompt.offsetWidth;
    prompt.style.animation = "";

    speakCurrent();
    run.shownAt = performance.now();
  }

  function speakCurrent() {
    if (!run) return;
    const { speakPrompts, voiceURI } = Settings.get();
    if (speakPrompts) Speech.speak(run.cards[run.index], voiceURI);
  }

  function advance() {
    if (!run) return;
    run.results.push({
      text: run.cards[run.index],
      ms: performance.now() - run.shownAt,
    });
    run.index += 1;
    presentCard();
  }

  function endRun() {
    Speech.cancel();
    renderSummary(run ? run.results : []);
    run = null;
    show("summary");
  }

  // --- Summary ------------------------------------------------------------

  function renderSummary(results) {
    const list = el("summary-list");
    list.replaceChildren();

    if (!results.length) {
      el("summary-headline").textContent = "No cards answered.";
      return;
    }

    const total = results.reduce((sum, r) => sum + r.ms, 0);
    const slowest = Math.max(...results.map((r) => r.ms));

    el("summary-headline").textContent =
      `${results.length} card${results.length === 1 ? "" : "s"} · ` +
      `${formatSeconds(total / results.length)} average · ` +
      `${formatSeconds(total)} total`;

    for (const result of results) {
      const item = document.createElement("li");
      if (result.ms === slowest && results.length > 1) item.classList.add("is-slowest");

      const text = document.createElement("span");
      text.className = "text";
      text.textContent = result.text;

      const time = document.createElement("span");
      time.className = "time";
      time.textContent = formatSeconds(result.ms);

      item.append(text, time);
      list.append(item);
    }
  }

  // --- Gesture on the card screen ----------------------------------------
  //
  // Tap anywhere advances; long-press replays the audio. The two share a
  // pointerdown, so the press timer decides which one the gesture turned out
  // to be.

  let pressTimer = null;
  let longPressFired = false;

  function beginPress() {
    longPressFired = false;
    pressTimer = setTimeout(() => {
      longPressFired = true;
      speakCurrent();
    }, LONG_PRESS_MS);
  }

  function endPress(shouldAdvance) {
    clearTimeout(pressTimer);
    pressTimer = null;
    if (shouldAdvance && !longPressFired) advance();
    longPressFired = false;
  }

  screens.card.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return; // the quit control
    beginPress();
  });
  screens.card.addEventListener("pointerup", (event) => {
    if (event.target.closest("button")) return;
    endPress(true);
  });
  screens.card.addEventListener("pointercancel", () => endPress(false));
  screens.card.addEventListener("contextmenu", (event) => event.preventDefault());

  // --- Settings screen ----------------------------------------------------

  function describeRunShape() {
    const { cardCount } = Settings.get();
    el("run-shape").textContent = cardCount === 0
      ? "Endless — end the run whenever you like."
      : `${cardCount} cards from a deck of ${PROMPTS.length}.`;
  }

  function renderCountOptions() {
    const container = el("count-options");
    container.replaceChildren();
    const { cardCount } = Settings.get();

    for (const option of Settings.COUNT_OPTIONS) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option === 0 ? "Endless" : String(option);
      button.setAttribute("aria-pressed", String(option === cardCount));
      button.addEventListener("click", () => {
        Settings.update({ cardCount: option });
        renderCountOptions();
        describeRunShape();
      });
      container.append(button);
    }
  }

  async function renderVoiceOptions() {
    const select = el("voice-select");
    const toggle = el("speak-toggle");
    const note = el("voice-note");
    const { speakPrompts, voiceURI } = Settings.get();

    toggle.checked = speakPrompts;

    if (!Speech.supported) {
      select.disabled = true;
      note.textContent = "This browser has no speech synthesis — prompts will be text only.";
      return;
    }

    const voices = await Speech.voices();
    select.replaceChildren();

    const fallback = document.createElement("option");
    fallback.value = "";
    fallback.textContent = "Device default";
    select.append(fallback);

    for (const voice of voices) {
      const option = document.createElement("option");
      option.value = voice.voiceURI;
      option.textContent = `${voice.name} (${voice.lang})`;
      select.append(option);
    }

    select.value = voiceURI && voices.some((v) => v.voiceURI === voiceURI) ? voiceURI : "";
    select.disabled = !speakPrompts;
    note.textContent = voices.length
      ? "Tap Done, then start a run to hear it."
      : "No voices reported by this device.";
  }

  el("speak-toggle").addEventListener("change", (event) => {
    Settings.update({ speakPrompts: event.target.checked });
    el("voice-select").disabled = !event.target.checked;
  });

  el("voice-select").addEventListener("change", (event) => {
    Settings.update({ voiceURI: event.target.value || null });
  });

  // --- Wiring -------------------------------------------------------------

  el("start").addEventListener("click", startRun);
  el("again").addEventListener("click", startRun);
  el("quit").addEventListener("click", endRun);
  el("summary-home").addEventListener("click", () => show("home"));

  el("open-settings").addEventListener("click", () => {
    renderCountOptions();
    renderVoiceOptions();
    show("settings");
  });

  el("settings-done").addEventListener("click", () => {
    describeRunShape();
    show("home");
  });

  // Backgrounding the page mid-run should not leave a voice talking to an
  // empty room.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) Speech.cancel();
  });

  describeRunShape();
  show("home");

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {
        // Offline support is a bonus; the app works without it.
      });
    });
  }
})();
