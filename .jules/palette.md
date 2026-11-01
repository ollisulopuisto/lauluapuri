# Palette journal

## 2026-11-01 - Editor focus visibility
- Finding: #lyrics-input (the app's primary editor) had outline:none + border:none and the stylesheet had no :focus rule anywhere, so keyboard focus on the editor was invisible (WCAG 2.4.7).
- Evidence: real-Tab keyboard focus in headless Chrome, before/after screenshots inspected; breakpoint sweep 390/768/1280.
- Fix: explicit :focus outline using the existing --action-color. Regression test test/editor-focus.test.js.
