# convoapp — Context

A mobile-first web applet for practising conversational fluency. Personal tool,
single user, no stakeholders.

## The problem

Responding to ordinary small talk in real time is a skill that degrades without
practice, and there is nowhere safe to practise it. The failure mode is not
ignorance of what to say — it is the stall: the two seconds of scramble before
anything comes out.

## What the app does

It feeds you small-talk prompts, one at a time, and you **respond out loud, in
real life**. The app never hears you. It is a prompt-feeder with a pacing
mechanism and a stopwatch, and it is deliberately nothing more.

## Vocabulary

| Term | Meaning |
| --- | --- |
| **Prompt** | A single line of small talk, phrased as something a person says *to* you. |
| **Card** | One prompt in play: displayed, spoken, timed, then dismissed by a tap. |
| **Run** | A sequence of cards, ended by exhausting the card count or by quitting. |
| **Deck** | The full flat list of prompts in `prompts.js`. |
| **Summary** | The end-of-run screen: every prompt paired with its elapsed time. |

## Core design decisions

### Self-paced, not timed

There is **no countdown**. The prompt appears, you respond, you tap to advance.
Each card is timed silently in the background.

**Why:** real conversation presents no visible shot clock. A drill that makes you
fluent *with* a countdown risks training a reflex that does not transfer. The
stopwatch measures pressure rather than creating it.

**Consequence:** nothing ends a card but your tap, so a run needs an explicit
length (see below).

### Runs are a fixed count, with endless as an option

Default 10 cards, configurable. An endless mode exists; in it, the summary fires
when you quit manually.

**Why:** a fixed *n* gives the run a finish line, which is what makes a drill
feel completed rather than abandoned. It also makes the summary's average
comparable between runs.

### Prompts are spoken *and* displayed

Each card renders the prompt text and speaks it via `SpeechSynthesis`.

**Why:** an earlier version of this design had the text hidden to force listening
practice. Rejected by the user on the grounds that response time does not vary
much with the text visible, and being able to read the prompt is wanted. The
app's job is prompt-delivery and pacing, not listening training.

**Consequence:** the reveal gesture became unnecessary, so **long-press replays
the audio** instead — useful when TTS garbles a word.

### Nothing persists but settings

`localStorage` holds the card count, the endless toggle, and the chosen voice.
Run times are held in memory and discarded when the run's summary is dismissed.

**Why:** the app cannot observe your actual performance — you respond out loud,
unrecorded — so it has no trustworthy data to accumulate. Cross-session history
would chart a number the app is not qualified to measure. Within-session times
are still useful because they are *comparative within one sitting* and paired
with the prompt that produced them.

**Revisit when:** the end-of-run summary turns out to be the thing you actually
look at. That is the evidence that earns persistence a place. If you never glance
at it, remove the stopwatch instead.

### The summary pairs each time with its prompt

Not an average alone.

**Why:** "7.4s average" is unactionable. "I stalled on *what have you been up
to*" is a finding. The prompt text is the part that carries meaning, and it is
what will eventually tell you which prompts to write more of.

### Shuffle and deal, not random with replacement

The deck is shuffled and the first *n* taken.

**Why:** independent draws from a ~50-card deck produce a duplicate in a 10-card
run roughly 60% of the time, which reads as a bug.

### Vanilla, no build step

Plain HTML/CSS/JS, classic `<script>` tags, no framework, no `node_modules`.

**Why:** there is almost no app here — one screen, a stopwatch, a tap handler, a
list. React's reconciler solves a problem this does not have, and a build step
adds a dependency tree to maintain for a tool that should still work in two
years. Classic scripts (rather than ES modules) keep the app openable directly
from the filesystem.

### Offline-first PWA

Service worker caches everything; installs to the homescreen.

**Why:** the app has no reason to ever touch the network — TTS is on-device and
the deck is local. The moments you would actually drill (walking, commuting, the
five minutes before going into something) are the moments signal is worst.

## Deliberately excluded

Each of these was considered and rejected, not overlooked.

| Excluded | Reason |
| --- | --- |
| Accounts, backend | No second user, no shared state, nothing to sync. |
| LLM-generated prompts at runtime | Drags in an API key, latency mid-drill, and a cost meter before the core loop is proven worth using. Small talk is a small domain; a hand-written deck may never go stale. **Revisit if** the deck is memorised within a fortnight. |
| Audio recording | Would give real feedback, but multiplies the build and you will not listen to it. |
| Self-rating after each card | You would be judging your own performance seconds after giving it — the worst moment for accurate assessment. |
| Cross-session history | See "nothing persists" above. |
| Prompt categories | A filing system for a collection that does not exist yet. Real small talk arrives uncategorised. |
| Difficulty tiers | Presumes a difficulty ranking you cannot produce before drilling. The summary times will reveal the real one. |
| Countdown timer | See "self-paced" above. |
| Framework, build step | See "vanilla" above. |

## Platform gotchas handled

- **`getVoices()` returns an empty array on first call in Chrome.** Must wait for
  the `voiceschanged` event. Handled in `speech.js`.
- **iOS Safari refuses to speak without a prior user gesture.** The run starts
  behind a tap, which satisfies it.
