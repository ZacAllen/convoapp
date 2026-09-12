/**
 * Deck — turns the flat prompt list into a run.
 *
 * Shuffle-and-deal rather than independent draws: with a ~50 card deck, drawing
 * 10 with replacement produces a duplicate in most runs, which reads as a bug.
 */
const Deck = (() => {
  /** Fisher-Yates, on a copy. */
  function shuffled(items) {
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  return {
    /**
     * @param {string[]} prompts
     * @param {number} count  cards wanted; 0 means "the whole deck, endlessly"
     * @returns {string[]} the run's cards, in order
     */
    deal(prompts, count) {
      const pool = shuffled(prompts);
      if (count === 0 || count >= pool.length) return pool;
      return pool.slice(0, count);
    },
  };
})();
