/**
 * Deck — turns the decks into the cards of a single run.
 *
 * Two jobs, deliberately separate: `pool` decides *which* cards are eligible,
 * `deal` decides which of them you get. Keeping them apart is what lets the
 * mixed draw be "pool both, then deal as normal" rather than a second dealing
 * algorithm.
 *
 * `pool` also normalises prompt shape, so the rest of the app only ever sees
 * `{ scene?, text }` and never has to ask whether a prompt was written as a
 * bare string.
 */
const Deck = (() => {
  const MIXED = "mixed";

  /** Fisher-Yates, on a copy. */
  function shuffled(items) {
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function normalise(prompt) {
    return typeof prompt === "string" ? { text: prompt } : { scene: prompt.scene, text: prompt.text };
  }

  return {
    MIXED,

    /**
     * The id a run will actually use. A saved deckId can outlive the deck it
     * names, so anything unrecognised resolves to MIXED — a stale setting
     * degrades to the full pool instead of emptying the app. Every caller that
     * needs to know "which deck is really selected" asks here, so the rule
     * lives in one place.
     * @param {Array} decks   every deck, as defined in prompts.js
     * @param {string} deckId the saved or requested id
     * @returns {string} a real deck id, or MIXED
     */
    resolve(decks, deckId) {
      return decks.some((deck) => deck.id === deckId) ? deckId : MIXED;
    },

    /**
     * The prompts eligible for a run, normalised to {scene?, text}.
     * @param {Array} decks    every deck, as defined in prompts.js
     * @param {string} deckId  a deck id, or MIXED for all of them
     * @returns {Array<{scene?: string, text: string}>}
     */
    pool(decks, deckId) {
      const chosen = decks.find((deck) => deck.id === deckId);
      const prompts = chosen ? chosen.prompts : decks.flatMap((deck) => deck.prompts);
      return prompts.map(normalise);
    },

    /**
     * Shuffle the pool and take the first `count` — not `count` independent
     * draws. Drawing with replacement from a ~50 prompt pool repeats a prompt
     * in most 10-card runs, which reads as a bug rather than as chance.
     *
     * @param {Array} pool   prompts from pool()
     * @param {number} count cards wanted; 0 means "the whole pool", which endless
     *                       mode cycles through and then reshuffles
     * @returns {Array} the run's cards, in order
     */
    deal(pool, count) {
      const shuffledPool = shuffled(pool);
      if (count === 0 || count >= shuffledPool.length) return shuffledPool;
      return shuffledPool.slice(0, count);
    },
  };
})();
