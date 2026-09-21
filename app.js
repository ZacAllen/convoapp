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
    const { cardCount, deckId } = Settings.get();
    const pool = Deck.pool(DECKS, deckId);
    run = {
      endless: cardCount === 0,
      pool,
      cards: Deck.deal(pool, cardCount),
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
      run.cards = Deck.deal(run.pool, 0);
      run.index = 0;
    }

    const card = run.cards[run.index];
    const prompt = el("prompt");
    const scene = el("scene");

    prompt.textContent = card.text;
    scene.textContent = card.scene || "";
    scene.hidden = !card.scene;

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
    // Only the line is spoken. The scene is stage direction, not dialogue.
    if (speakPrompts) Speech.speak(run.cards[run.index].text, voiceURI);
  }

  function advance() {
    if (!run) return;
    run.results.push({
      ...run.cards[run.index],
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
      if (result.scene) {
        const scene = document.createElement("span");
        scene.className = "row-scene";
        scene.textContent = result.scene;
        text.append(scene);
      }
      text.append(document.createTextNode(result.text));

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
    const { cardCount, deckId } = Settings.get();
    const available = Deck.pool(DECKS, deckId).length;
    const chosen = DECKS.find((deck) => deck.id === Deck.resolve(DECKS, deckId));
    // A Mixed run draws from every deck, so calling its pool "a deck" would
    // conflate two distinct terms — see the glossary in CONTEXT.md.
    const source = chosen ? `the ${chosen.name} deck of ${available}` : `all ${available}`;

    el("run-shape").textContent = cardCount === 0
      ? `Endless, from ${source} — end the run whenever you like.`
      : `${cardCount} cards from ${source}.`;
  }

  /**
   * A row of pill chips where exactly one is pressed. Both selectors are this
   * same control, so they share a builder.
   * @param {string} containerId
   * @param {Array<{value: *, label: string}>} options
   * @param {*} selected  the value whose chip reads as pressed
   * @param {(value: *) => void} onPick
   */
  function renderChips(containerId, options, selected, onPick) {
    const container = el(containerId);
    container.replaceChildren();

    for (const option of options) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option.label;
      button.setAttribute("aria-pressed", String(option.value === selected));
      button.addEventListener("click", () => {
        onPick(option.value);
        describeRunShape();
      });
      container.append(button);
    }
  }

  /** The deck chips on the title screen: each deck, plus Mixed for all of them. */
  function renderDeckOptions() {
    const { deckId } = Settings.get();
    const options = [
      ...DECKS.map((deck) => ({ value: deck.id, label: deck.name })),
      { value: Deck.MIXED, label: "Mixed" },
    ];
    renderChips("deck-options", options, Deck.resolve(DECKS, deckId), (value) => {
      Settings.update({ deckId: value });
      renderDeckOptions();
    });
  }

  function renderCountOptions() {
    const { cardCount } = Settings.get();
    const options = Settings.COUNT_OPTIONS.map((count) => ({
      value: count,
      label: count === 0 ? "Endless" : String(count),
    }));
    renderChips("count-options", options, cardCount, (value) => {
      Settings.update({ cardCount: value });
      renderCountOptions();
    });
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

  renderDeckOptions();
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
