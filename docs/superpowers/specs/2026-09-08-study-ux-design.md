# Study workspace hierarchy

Approved in conversation: apply all six proposed UX improvements, preserving every existing capability and information view. This is a restructuring of the existing Study interface. Continue in the user's shared dev checkout so the running local app includes the existing Reset fix and their edits.

Desktop: a single activity header and region selector; stable left structure browser; contextual right inspector; canvas controls grouped into Layers, Appearance, Save & export and Help. Library and Review use a wider panel. Selection never scrolls or displaces search. The inspector contains Focus, Isolate, Pin label, a More actions disclosure, structure information, and a close/back action. Camera fitting and labels reserve the visible panels' space.

Mobile: one sheet with collapsed, half, and expanded positions and explicit accessible resize buttons, plus a drag handle. Browser and inspector occupy the same sheet; returning preserves search, filters and scroll. Tool groups use that same sheet. Portrait and landscape must preserve a usable anatomy area; full sheet is an intentional reading state.

Hierarchy: region in the header once; activity title 20–24 px, section title 16 px, body 14 px with 1.5–1.6 line height, supporting text 12–13 px. Controls use consistent 8 px radii, at least 44 px touch targets, visible keyboard focus, neutral borders and a restrained teal accent. One primary action per setup/task; whitespace and alignment separate groups instead of many nested boxes.

Search combines an accessible Region/Whole atlas scope selector with the input. Filters expand on demand and active choices remain removable. About this region holds counts and coverage. Scene status exposes cutaway, opacity, hidden pieces, isolation, and label state with direct reset actions. Active settings remain discoverable when tools close.

Practice offers three selectable modes, concise descriptions, expandable full instructions and one Start practice action. During questions, progress, prompt, answer and feedback dominate. Review retains scheduling details and import/export inside disclosures. Library retains all sets, scenes, sharing and import/export. Lessons preserve every step, source and practice action.

Validation: local Vite app and Playwright real-browser tests of navigation, stable selection, search/filters, tools and reset states, practice, mobile sheet and viewport bounds. Run existing data/behavior validation and production build. Do not deploy or push.

## Refinements approved during local review

- Strong slate activity header, tinted panel headings, defined list rows and consistent selected states.
- Replace stacked search tabs with one search field and a quiet scope dropdown beside Filters.
- Display anatomy names in sentence case, preserving original source data and acronyms.
- Remove the floating Explorer tools menu. Show a Shortcuts reference from the footer.
- Align Explorer search input and results as one card.
- Escape closes the selected inspector and deselects in one action in both modes.
- Consolidate global tools into a right vertical icon rail in Explorer and Study. Keep contextual Hide with selection and Restore hidden with Layers. Explorer has a distinct Orbit control with two rotation directions and only one Reset; the bottom dock contains only Explode.
- Preserve user orbit, pan and relative zoom during Study panel reflow, focus opened tools, and restore keyboard focus on close.
