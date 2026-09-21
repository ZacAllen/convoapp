# No build step, no framework

The app is plain HTML, CSS, and classic `<script>` tags — not ES modules, not a
bundler, no dependencies.

There is very little app here: four screens, a stopwatch, a tap handler, and a
list. A framework's reconciler solves a problem this does not have, and a build
step adds a dependency tree to maintain for a tool that should still work
untouched in several years. Classic scripts rather than ES modules keep the app
openable directly from the filesystem, with no server and no CORS rules.

## Consequences

Files share a small set of globals (`DECKS`, `Deck`, `Settings`, `Speech`)
rather than importing each other, and script order in `index.html` matters.
Adding a file means editing both `index.html` and the precache list in `sw.js`.
