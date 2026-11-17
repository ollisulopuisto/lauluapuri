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
