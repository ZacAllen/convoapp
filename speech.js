/**
 * Speech — a small interface over a genuinely awkward browser API.
 *
 * Two platform facts this module exists to hide:
 *
 *  1. Chrome's speechSynthesis.getVoices() returns [] on first call and only
 *     populates after a 'voiceschanged' event. Callers here just await voices().
 *  2. iOS Safari refuses to speak until the page has seen a user gesture. The
 *     app's start button satisfies this; nothing extra is needed here, but it is
 *     why speak() must never be called during page load.
 */
const Speech = (() => {
  const synth = window.speechSynthesis;
  const supported = typeof synth !== "undefined";

  let cached = null;
  let pending = null;

  function readVoices() {
    const list = synth.getVoices();
    return list && list.length ? list : null;
  }

  /**
   * @returns {Promise<SpeechSynthesisVoice[]>} may resolve to [] on a device
   *          with no voices installed; never rejects.
   */
  function voices() {
    if (!supported) return Promise.resolve([]);
    if (cached) return Promise.resolve(cached);
    if (pending) return pending;

    pending = new Promise((resolve) => {
      const immediate = readVoices();
      if (immediate) return resolve((cached = immediate));

      // Chrome: wait for the event, but do not hang forever if it never fires.
      const done = (result) => {
        synth.removeEventListener("voiceschanged", onChange);
        clearTimeout(timer);
        resolve((cached = result));
      };
      const onChange = () => {
        const list = readVoices();
        if (list) done(list);
      };
      const timer = setTimeout(() => done(readVoices() || []), 1500);

      synth.addEventListener("voiceschanged", onChange);
    });

    return pending;
  }

  return {
    supported,
    voices,

    /**
     * Speak text, cancelling anything already in flight so a replay does not
     * queue up behind the original.
     * @param {string} text
     * @param {string|null} voiceURI  a voiceURI from voices(); falls back to the
     *                                device default if absent or unavailable.
     */
    speak(text, voiceURI) {
      if (!supported) return;
      try {
        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        if (voiceURI && cached) {
          const match = cached.find((v) => v.voiceURI === voiceURI);
          if (match) utterance.voice = match;
        }
        synth.speak(utterance);
      } catch {
        // A silent card is a degraded card, not a broken one — the text is on
        // screen regardless.
      }
    },

    cancel() {
      if (!supported) return;
      try {
        synth.cancel();
      } catch {
        /* nothing to recover */
      }
    },
  };
})();
