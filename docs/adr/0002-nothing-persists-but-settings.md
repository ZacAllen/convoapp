# Nothing persists but settings

Run times live in memory and are discarded once the summary is dismissed. Only
the card count, chosen deck, and voice are written to `localStorage`.

The app cannot observe actual performance — the user answers out loud and
unrecorded — so any history it accumulated would chart a number it is not
qualified to measure. Within-run times are still shown, because they are
comparative within one sitting and paired with the prompt that produced them.

## Considered Options

Self-rating after each card was rejected: the user would be judging their own
performance seconds after giving it, which is the worst moment for an accurate
assessment. Audio recording was rejected as a large build the user would not
listen back to.

## Consequences

There is no way to tell whether the user is improving across sessions. Revisit
this if the summary turns out to be the screen they actually study; that is the
evidence that would earn persistence a place.
