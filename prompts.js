/**
 * The decks.
 *
 * A prompt is either a bare string, or an object with a `scene` — stage
 * direction naming who you are talking to. The scene is shown on screen but
 * never spoken, because it is not something anybody says out loud.
 *
 * In both decks the prompt is phrased as something a person says *to* you, so
 * the natural reaction is to answer it rather than to read it. In Business
 * Calls you are always the customer who has rung in; the app speaks as the
 * business.
 *
 * Edit freely. A deck needs an `id`, a `name`, and a non-empty `prompts` array.
 * If you change anything here, bump CACHE in sw.js.
 */
const DECKS = [
  {
    id: "smalltalk",
    name: "Small Talk",
    prompts: [
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
    ],
  },

  {
    id: "business",
    name: "Business Calls",
    prompts: [
      { scene: "Landscaping company", text: "What price range are you looking for?" },
      { scene: "Landscaping company", text: "Roughly how big is the garden?" },
      { scene: "Landscaping company", text: "Were you after a one-off tidy-up, or regular visits?" },

      { scene: "Dental practice", text: "Are you an existing patient with us?" },
      { scene: "Dental practice", text: "Is this for a check-up, or are you in pain?" },
      { scene: "Dental practice", text: "What days generally work best for you?" },

      { scene: "Plumber", text: "Is this an emergency, or can it wait until Monday?" },
      { scene: "Plumber", text: "Can you describe what it's doing exactly?" },
      { scene: "Plumber", text: "Do you know where your stopcock is?" },

      { scene: "Gym", text: "Have you trained anywhere before?" },
      { scene: "Gym", text: "What are you hoping to get out of it?" },
      { scene: "Gym", text: "Would you like to come in and look around first?" },

      { scene: "Insurance company", text: "Can I take your policy number?" },
      { scene: "Insurance company", text: "What's the reason for the claim?" },
      { scene: "Insurance company", text: "Has anyone else been driving the vehicle?" },

      { scene: "Veterinary clinic", text: "What's your pet's name and age?" },
      { scene: "Veterinary clinic", text: "How long has he been off his food?" },
      { scene: "Veterinary clinic", text: "Is this something we've seen him for before?" },

      { scene: "Car garage", text: "What's the registration?" },
      { scene: "Car garage", text: "What sort of noise is it making?" },
      { scene: "Car garage", text: "How soon do you need it back?" },

      { scene: "Hair salon", text: "Have you been to us before?" },
      { scene: "Hair salon", text: "Who did you see last time?" },

      { scene: "Bank", text: "Can you confirm your date of birth for me?" },
      { scene: "Bank", text: "Which transaction are you querying?" },
      { scene: "Bank", text: "Have you shared your details with anyone?" },

      { scene: "Moving company", text: "How many bedrooms are we talking about?" },
      { scene: "Moving company", text: "Is there parking outside both properties?" },
      { scene: "Moving company", text: "Did you want packing included?" },

      { scene: "IT support", text: "What were you doing when it happened?" },
      { scene: "IT support", text: "Have you tried restarting it?" },
      { scene: "IT support", text: "What's the exact wording of the error?" },

      { scene: "Letting agent", text: "What's your budget per month?" },
      { scene: "Letting agent", text: "When are you looking to move in?" },
      { scene: "Letting agent", text: "Is anyone else going to be on the tenancy?" },

      { scene: "Restaurant", text: "How many in the party?" },
      { scene: "Restaurant", text: "Any allergies or dietary requirements?" },
      { scene: "Restaurant", text: "Would you prefer inside or out?" },

      { scene: "Accountant", text: "Are you a sole trader, or a limited company?" },
      { scene: "Accountant", text: "Have you filed a return before?" },

      { scene: "Broadband provider", text: "Can I take the account holder's name?" },
      { scene: "Broadband provider", text: "Is it affecting calls as well as internet?" },
      { scene: "Broadband provider", text: "Are you happy for me to run a line test?" },

      { scene: "Heating engineer", text: "How old is the boiler?" },
      { scene: "Heating engineer", text: "Is it losing pressure, or just not firing?" },
      { scene: "Heating engineer", text: "Do you have a service plan with us?" },

      { scene: "Law firm", text: "What's the matter relating to?" },
      { scene: "Law firm", text: "Have you taken advice on this already?" },

      { scene: "Photographer", text: "What date have you got in mind?" },
      { scene: "Photographer", text: "Roughly how many guests?" },
    ],
  },
];
