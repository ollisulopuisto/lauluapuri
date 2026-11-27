# Work log

## 2026-11-27: rhyme key index (Bolt perf)

`findRhymes` rebuilt every word's rhyme key on every query: 9-25 ms per lookup
(91 531 words), repeated per keystroke and per strip selection with the same
settings. Now a WeakMap keyed on the prepared word list caches a `Map<key,
indices>` per (tier, breadth), built lazily on first use, so a repeat query is
a lookup plus the sort of the matches: ~0-2 ms steady state in this sandbox
(assonance b=3: ~24 ms -> <1 ms; full b=1: ~9 ms -> ~2 ms, remaining cost is
the sort of thousands of matches). First query per setting combination pays
one index build (~10-20 ms), same order as one old-style query.

Validation: `vitest run` 44/44 pass. Output parity: 480 query results (10
words x 48 tier/breadth/rhythm/closest combinations) dumped as JSON before and
after the change, byte-identical. Duplicate check: no open PRs, recent
rhyme.js history is selection/strip feature work. PR-only per the publication
hold; no merge, no deploy.

## 2026-11-17: keyboard syllable selection

Implemented the approved Shift+Left/Right rhyme-tail selection in edit mode.
Mouse/touch handlers keep their existing behavior. Native keyboard selections
bypass automatic syllable snapping so modifier chords and cross-word overflow
remain usable. Write mode and IME composition do not invoke the command.

Validation: the new stepping tests failed before the function existed. The real
Chromium keyboard workflow failed before wiring the handler (character-sized
selection instead of the final syllable); it passes after the change. Unit tests
and browser workflow cover growing, shrinking, collapse, native overflow,
selection direction, write mode, modifiers and composition. The selected suffix
and live rhyme strip were inspected in a screenshot. Native Safari/macOS/iOS
hardware keyboard checks have not been run here.

Do not merge without resolving the publication hold: main automatically deploys
the GitHub Pages site, and this task was approved as PR-only with no publication.

Independent review follow-up: touchstart now clears the native-keyboard bypass
even when a platform touch handle does not emit pointerdown. The real-browser
regression failed before the reset and passes after it; keyCode 229 is also
covered independently of isComposing. Browser CI remains a follow-up: this repo
currently deploys only on main and uses default CodeQL checks for PRs.

## 2026-11-18: tap-driven rhyme strip

Replaced selection-snapping with the approved tap interaction: tapping a word in
Muokkaa opens its syllables, tapping a syllable sets where the rhyme part starts
(tapping the leftmost active syllable clears it), and tapping a rhyme chip swaps
the word in place while the strip stays open on the new word. Shift+Left/Right
adjusts the rhyme part directly without touching the text; plain text selection
is native editing again and no longer drives rhymes. The strip is now two rows
(syllables, then horizontally scrollable rhymes): the header of the analysis
panel on desktop, fixed to the bottom edge on mobile. Mobile layout B moves
save/download/share into a bottom icon bar so the editor comes first.
Selection-snapping code and its tests were removed; ?popup keeps the old
floating popup.

Validation: unit tests rewritten for the caret/syllable model (44 pass). The
real Chromium workflow covers caret-opens-strip, syllable tap and clear,
shift+arrow adjustment without moving the caret, native selection and IME
passthrough, and quiet write mode; it passes. Desktop and mobile rendering were
inspected in screenshots. Native Safari/iOS touch checks have not been run here.

Devin review fixes: #song-name gets min-width: 0 so the bottom icon bar fits a
320px viewport; save/download/share buttons carry persistent Finnish aria-labels
(labels are icon-only on mobile); the share handler swaps only the label text so
the icon survives the copied state. Verified with real renders at 320px and
390px plus the unit and browser workflows.
