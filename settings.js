/**
 * Settings — the only thing that survives a session.
 *
 * Hides the fact that localStorage can throw (private browsing, blocked site
 * data) and that whatever comes back out of it is untrusted. Callers get a
 * valid settings object or a valid settings object; there is no third case.
 */
const Settings = (() => {
  const KEY = "convoapp.settings";

  const DEFAULTS = {
    cardCount: 10,   // cards per run; 0 means endless
    deckId: Deck.MIXED, // a deck id from prompts.js, or Deck.MIXED for all of them
    voiceURI: null,  // null = let the device choose
    speakPrompts: true,
  };

  const COUNT_OPTIONS = [5, 10, 20, 0];

  function coerce(raw) {
    const out = { ...DEFAULTS };
    if (!raw || typeof raw !== "object") return out;

    if (COUNT_OPTIONS.includes(raw.cardCount)) out.cardCount = raw.cardCount;
    // Any string is allowed through: a deck id that no longer exists is Deck's
    // problem to degrade from, not something to silently rewrite here.
    if (typeof raw.deckId === "string" && raw.deckId) out.deckId = raw.deckId;
    if (typeof raw.voiceURI === "string") out.voiceURI = raw.voiceURI;
    if (typeof raw.speakPrompts === "boolean") out.speakPrompts = raw.speakPrompts;

    return out;
  }

  function load() {
    try {
      return coerce(JSON.parse(localStorage.getItem(KEY)));
    } catch {
      return { ...DEFAULTS };
    }
  }

  let current = load();

  return {
    COUNT_OPTIONS,

    get() {
      return { ...current };
    },

    /** Merge a patch in and persist. Silently tolerates storage being unavailable. */
    update(patch) {
      current = coerce({ ...current, ...patch });
      try {
        localStorage.setItem(KEY, JSON.stringify(current));
      } catch {
        // Settings stay correct for this session; that is good enough.
      }
      return { ...current };
    },
  };
})();
