# Prompts are shown and spoken; scenes are only shown

Each card renders its prompt as text *and* speaks it through the browser's
speech synthesis. Where a card has a Scene, the scene is rendered but never
passed to the speech engine.

An earlier design hid the prompt text to force listening practice. That was
rejected: response time does not vary much with the text visible, and being able
to read the prompt is wanted. The scene is the opposite case — it is stage
direction, not dialogue. Speaking it would produce "Landscaping company, what
price range are you looking for", which no caller has ever said, putting noise
in the one channel meant to simulate a real voice.

## Consequences

A future reader may notice the scene is deliberately excluded from
`Speech.speak(card.text)` and assume it is an oversight. It is not. The split
also means a prompt is not a single string: the data model carries `scene` and
`text` separately so the two can be routed to different places.
