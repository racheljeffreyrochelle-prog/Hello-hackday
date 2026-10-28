# Le Donjon des Mots: speech test (Monster 1)

The first build step from [the PRD](../docs/Le-Donjon-des-Mots.md). Before building four monsters, this tests the biggest risk: can the browser understand a 10-year-old's French at home, with siblings nearby?

**One monster, Champi** (where I live). Champi asks *Où habites-tu ?*, *Tu habites où ?* or *Tu habites dans une ville ou dans un village ?*. Five good answers fill the mood bar, then you **SPARE** Champi.

- Tap 🎤 and speak. The game checks the *J'habite…* pattern, not the town name.
- If it hears nothing, it doesn't count as a miss.
- After one miss, Champi says "Encore ?" and repeats the question slowly. After two misses, tap choices appear.
- If he spares Champi using only his voice, he earns a ★. **Rejouer** shuffles the questions.
- The music brightens as Champi cheers up and goes quiet while the game is listening.

## Running it
It must be served over **https** or from **localhost** (browsers block the microphone elsewhere). Use Chrome or Safari; Firefox has no speech recognition and falls back to tap answers.

```sh
cd game && python3 -m http.server 8000   # then open http://localhost:8000
node --test game/*.test.js               # answer-checking tests (from repo root)
```

On GitHub Pages it's served at `…/game/`.

## For the grown-up: running the test
1. Sit with him for the first session (5 minutes). Let him play normally.
2. Afterwards, open **Grown-ups**. Each spoken answer shows what the game heard. Tick **"He was right"** wherever it said wrong but he said it well.
3. Read the result against the PRD target: *"…but he was right"* should be **under 20%** of spoken answers. **Copy results** puts everything on the clipboard so you can share it.
4. If the result is well over 20%, recognition isn't good enough yet. The next options are a quieter setup, more lenient checking, or the speak-then-self-check design. We'd decide that before building monsters 2–4.

Nothing is stored except on this device. Chrome and Safari send the audio to Google or Apple to turn it into text.
