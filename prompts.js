/**
 * The deck.
 *
 * Each prompt is phrased as something a person says *to* you, so that the
 * natural reaction is to answer it out loud rather than to read it.
 *
 * Flat and uncategorised on purpose — real small talk does not announce its
 * genre in advance. Edit freely; the app only needs a non-empty array.
 */
const PROMPTS = [
  // Openers with a stranger
  "So what do you do for work?",
  "What brings you here?",
  "How do you know everyone here?",
  "Is this your first time at one of these?",
  "Sorry, I didn't catch your name?",
  "Have we met before? You look familiar.",
  "Where are you from originally?",
  "Have you lived around here long?",
  "First time in this part of town?",
  "How are you finding it here?",

  // The standard-issue ones you should never be caught out by
  "How was your weekend?",
  "How's your week going so far?",
  "Did you get up to anything nice at the weekend?",
  "What have you been up to lately?",
  "Have you been busy?",
  "Busy day?",
  "Anything exciting happening this week?",
  "What's keeping you busy at the moment?",

  // Work
  "How's the new job going?",
  "How long have you been doing that?",
  "Do you enjoy it?",
  "What made you get into that?",
  "Did you always want to do this kind of work?",
  "Do you commute far?",
  "How was the journey over?",

  // Outside work
  "What do you do when you're not working?",
  "Do you get much free time?",
  "Seen anything good lately?",
  "Are you reading anything at the moment?",
  "What kind of music are you into?",
  "Do you follow any sports?",
  "Did you catch the game last night?",
  "Are you much of a cook?",
  "Do you have any pets?",

  // Plans and travel
  "Do you have any plans for the holidays?",
  "Any holidays coming up?",
  "Where did you go on your last trip?",
  "Got anything planned for the weekend?",

  // The shared situation — easiest to use, easiest to fumble
  "Crazy weather we've been having, isn't it?",
  "What's good on the menu here?",
  "Are you a coffee or a tea person?",
  "Do you know if there's anywhere good to eat around here?",
  "Have you tried that new place that opened up?",
  "I love your jacket — where's it from?",

  // Catching up
  "Long time no see — how have you been?",
  "How's the family?",
  "We should catch up properly sometime.",

  // Awkward recoveries — the ones worth drilling most
  "Sorry, what were you saying? I got distracted.",
  "You've gone quiet — everything all right?",
  "Anyway... what else is new?",
  "So what's your story?",

  // Closing
  "I should probably get going soon, but it was good to see you.",
];
