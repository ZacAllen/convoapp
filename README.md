# convoapp

A mobile-first web applet for practising small talk. It shows you a prompt,
speaks it aloud, and times how long you take — you answer **out loud, in real
life**. Personal tool; see [CONTEXT.md](CONTEXT.md) for the design reasoning.

## Using it

1. Tap **Start a run**.
2. A prompt appears and is spoken. Answer it out loud.
3. **Tap anywhere** for the next card. **Long-press** to hear the prompt again.
4. After 10 cards you get a summary: every prompt paired with how long you took,
   slowest highlighted.

Settings let you change the run length (5 / 10 / 20 / endless), pick a voice, or
turn speech off.

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

**GitHub Pages:** push to GitHub, then Settings → Pages → deploy from branch,
root folder. Open the resulting URL on your phone and use *Add to Home Screen*.
It then launches full-screen and works offline.

## Editing the deck

`prompts.js` is a plain array of strings. Add, delete, or reword freely — the app
only needs a non-empty array. Prompts read best phrased as something a person
says *to* you, so the natural reaction is to answer rather than to read.

If you change any file, bump `CACHE` in `sw.js` — otherwise devices that have
already installed the app keep serving the old cached copy.

## Layout

| File | Role |
| --- | --- |
| `index.html` | The four screens: home, card, summary, settings. |
| `app.js` | Screen switching, the run state machine, tap/long-press gesture. |
| `prompts.js` | The deck. The only file you will edit regularly. |
| `deck.js` | Shuffle-and-deal. |
| `settings.js` | Persisted settings, with `localStorage` failure hidden. |
| `speech.js` | Text-to-speech, wrapping the browser's awkward voice loading. |
| `styles.css` | All styling; dark by default, follows the system theme. |
| `sw.js` | Service worker — precaches everything for offline use. |

No build step, no dependencies, no framework.
