# Regional anatomy study

Approved scope: implement the four workflows in the conversation, in order, for medical and allied-health students. Work remains on `feature/anatomy-study`.

1. Choose a region: upper limb, thorax, and head and neck have explicit collections of existing atlas concepts across systems. They are starter collections, not claims of exhaustive regional coverage. Fit the camera to the region.
2. Explore: retain regional context, pin up to six concept labels, display a camera-aware patient orientation compass, hide selected pieces, and undo hiding in reverse order. Restore all is available. Selection and pinned labels follow visible meshes.
3. Practice: choose naming or finding. Naming highlights a concept and accepts its atlas name, normalized for case/spacing/punctuation. Finding shows a spaced inventory of a small set of distinct concepts to ensure all targets can be picked. Accept any member mesh of the requested concept. Suppress all structure names and inspection during unanswered questions except the explicit find prompt. Give feedback and an answer reveal; do not advance automatically. Shuffle questions and offer a session summary.
4. Review: automatically add missed/revealed concepts to a deduplicated revision collection. Persist only versioned concept identifiers and mistake counts in localStorage, validate loaded values against the atlas, recover from malformed/unavailable storage, and expose manual removal and retry. A correct answer does not silently remove a saved item.

Use the current atlas without adding unsupported anatomical facts or external services. Reuse the renderer and selection geometry. Keep the existing explorer accessible. Support desktop and phone layouts, loading/error states, and keyboard-accessible forms and buttons. No new runtime dependencies.
