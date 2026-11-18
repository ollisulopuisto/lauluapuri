# Work log

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
