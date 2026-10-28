# PRD: *Le Donjon des Mots*

Status: **agreed** (28 Oct 2026). Next step: one-monster speech test (`game/`).

## 1. Problem
A 10-year-old has one French lesson a week and no French speakers at home. He knows *J'habite…* and numbers 0–100 but rarely says them aloud between lessons, so his speaking confidence doesn't grow. He enjoys computer games and would practise if it felt like play.

## 2. Users
- **Primary:** the child (10), at home on a phone or home computer, often with siblings nearby. Already taught the content.
- **Secondary:** the parent, who opens the game, grants the microphone, and notices whether practice carries into real life.

## 3. Goal
Short, regular, low-pressure **speaking** practice of French he already knows, leading to him using French with family unprompted.

## 4. Core journey
1. He opens a web link and allows the microphone. A 20-second intro: he falls into a dungeon.
2. A sad monster asks a question aloud in French (optional subtitles).
3. He taps the big button and speaks. Correct: the monster's mood bar rises and its music brightens. First miss: "encore ?" and the question is repeated slowly. Second miss: tap options appear.
4. About five good answers make the monster happy, and he presses **SPARE**. Progress saves.
5. Roughly 5 minutes per monster. He can carry on to the next one if he wants. After four monsters the exit opens and he's home.
6. **Replay:** monsters return with shuffled questions and new numbers. He earns a star for each monster cheered up with no tap fallbacks.

## 5. Content
| Monster | Practice | Example |
|---|---|---|
| 1 | Where I live | "Où habites-tu ?" leading to *J'habite à [town]* / *dans une ville* / *dans un petit village* |
| 2 | Numbers 0–20 | Shows **14**: "C'est quel nombre ?", answer *quatorze* |
| 3 | Numbers 21–69 | **47**, answer *quarante-sept* |
| 4 | Numbers 70–100 ("boss") | **92**, answer *quatre-vingt-douze* |

For "where I live", the game checks the French sentence pattern, not the town name, so a misheard English place name never counts against him.

## 6. Smallest useful release (MVP)
- Four monsters, the speak-or-tap loop, mood bar, spare, end screen.
- Replay with shuffled questions and stars.
- Synthesised or recorded French voice, simple original art, one music loop per monster. Music turns down while the game is listening.
- Browser web app (phone and computer), progress saved on the device.
- Local counter of answers he gets right by speaking on the first try.
- **Build order:** a one-monster speech test first (checks recognition on his voice at home), then the rest.

## 7. Out of scope (for now)
Accounts and logins; teacher or parent dashboards; combat; leaderboards; storing recordings; grading pronunciation; teaching new vocabulary; other topics or languages; purchases; a long story; anything copied from Undertale (characters, names, music, art). Inspired by its tone and "spare" mechanic only.

## 8. Accessibility baseline
No timers. Every question spoken aloud, with optional subtitles. Large touch targets. Readable sans-serif text. Music and voice volume controls. A full tap-only mode if the microphone is unavailable or refused.

## 9. Success measures (2-week trial)
- Spares all four monsters within week 1.
- Chooses to replay on at least 2 evenings in week 2.
- First-try spoken success rate rises from first to last sessions.
- The game wrongly marks him "wrong" in fewer than 1 in 5 answers (parent watches the first session).
- Parent diary shows more unprompted French with parent or grandparents than in the week before.

## 10. Assumptions not yet proven
1. Browser speech recognition understands a 10-year-old beginner's French well enough, with siblings nearby. **Biggest risk**, hence the speech test first.
2. The phrases match his class exactly (e.g. *"Où habites-tu ?"* vs *"Tu habites où ?"*). Both are accepted.
3. The family is comfortable that recognition in Chrome or Safari sends audio to Google or Apple. The game stores nothing.
4. His browser supports speech recognition (Firefox doesn't, so it falls back to tap mode).
5. The Undertale-style tone and the music keep him coming back without prompting.
6. Speaking practice in the game carries over into speaking French with family.
