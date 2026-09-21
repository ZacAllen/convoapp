# convoapp

A mobile-first web applet for practising conversation. It shows you a prompt,
speaks it aloud, and times how long you take — you answer **out loud, in real
life**. Personal tool.

[CONTEXT.md](CONTEXT.md) is the glossary; [docs/adr/](docs/adr/) records the
decisions worth knowing before changing anything.

## Using it

1. Pick what to practise — a single deck such as **Small Talk** or
   **Business Calls**, or **Mixed**, which pools every deck.
2. Tap **Start a run**.
3. A prompt appears and is spoken. Answer it out loud.
4. **Tap anywhere** for the next card. **Long-press** to hear the prompt again.
5. After 10 cards you get a summary: every prompt paired with how long you took,
   slowest highlighted.

Settings let you change the run length (5 / 10 / 20 / endless), pick a voice, or
turn speech off.

### The decks

**Small Talk** is social: openers with a stranger, catching up, awkward
recoveries.

**Business Calls** puts you on the phone *to* a business — you are the customer
who has rung in, and the app speaks as the representative. Each card carries a
**scene** naming who you are talking to (`LAW FIRM`, `PLUMBER`), shown on screen
but never spoken, because nobody says it out loud.

## Running it locally

Any static file server will do:

```sh
python -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` straight from the filesystem also works — there is no
bundler and nothing is fetched at runtime — but the service worker (and so
offline support) only registers over `http://` or `https://`.

## Putting it on your phone

Deploy the folder as-is; there is nothing to build.

Offline support is worth having rather than incidental: speech is synthesised on
the device and the decks are local, so the app never needs the network — and the
moments you would actually drill (walking, commuting, the five minutes before you
go into something) are the moments signal is worst.

**GitHub Pages:** push to GitHub, then Settings → Pages → deploy from branch,
root folder. Open the resulting URL on your phone and use *Add to Home Screen*.
It then launches full-screen and works offline.

## Editing the decks

`prompts.js` holds every deck. A deck needs an `id`, a `name`, and a non-empty
`prompts` array:

```js
{
  id: "interviews",
  name: "Interviews",
  prompts: [
    "Tell me about yourself.",
    { scene: "Panel interview", text: "Why this role, and why now?" },
  ],
}
```

A prompt is either a bare string or `{ scene, text }`. Add a deck to `DECKS` and
it appears on the title screen automatically — no other *source* file needs
touching, because the selector is built from `DECKS` at runtime.

Prompts read best phrased as something a person says *to* you, so the natural
reaction is to answer rather than to read.

Whatever you edit, bump `CACHE` in `sw.js` — otherwise devices that have already
installed the app keep serving the old cached copy. That applies to editing
`prompts.js` too; it is the one step adding a deck cannot avoid.

## Layout

| File | Role |
| --- | --- |
| `index.html` | The four screens: home, card, summary, settings. |
| `app.js` | Screen switching, the run state machine, tap/long-press gesture. |
| `prompts.js` | The decks. The only file you will edit regularly. |
| `deck.js` | Choosing a pool of cards, and dealing a run from it. |
| `settings.js` | Persisted settings, with `localStorage` failure hidden. |
| `speech.js` | Text-to-speech, wrapping the browser's awkward voice loading. |
| `styles.css` | All styling; dark by default, follows the system theme. |
| `sw.js` | Service worker — precaches everything for offline use. |

No build step, no dependencies, no framework.
