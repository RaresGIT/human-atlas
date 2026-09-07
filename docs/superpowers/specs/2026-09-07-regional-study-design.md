# Regional anatomy study

Approved scope: implement the four workflows in the conversation, in order, for medical and allied-health students. Work remains on `feature/anatomy-study`.

1. Choose a region: upper limb, thorax, and head and neck have explicit collections of existing atlas concepts across systems. They are starter collections, not claims of exhaustive regional coverage. Fit the camera to the region.
2. Explore: retain regional context, pin up to six concept labels, display a camera-aware patient orientation compass, hide selected pieces, and undo hiding in reverse order. Restore all is available. Selection and pinned labels follow visible meshes.
3. Practice: choose naming or finding. Naming highlights a concept and accepts its atlas name, normalized for case/spacing/punctuation. Finding shows a spaced inventory of a small set of distinct concepts to ensure all targets can be picked. Accept any member mesh of the requested concept. Suppress all structure names and inspection during unanswered questions except the explicit find prompt. Give feedback and an answer reveal; do not advance automatically. Shuffle questions and offer a session summary.
4. Review: automatically add missed/revealed concepts to a deduplicated revision collection. Persist only versioned concept identifiers and mistake counts in localStorage, validate loaded values against the atlas, recover from malformed/unavailable storage, and expose manual removal and retry. A correct answer does not silently remove a saved item.

Use the current atlas without adding unsupported anatomical facts or external services. Reuse the renderer and selection geometry. Keep the existing explorer accessible. Support desktop and phone layouts, loading/error states, and keyboard-accessible forms and buttons. No new runtime dependencies.

## User-requested interaction refinements

Selection must remain identifiable through occluding anatomy in both viewers: render a contrasting outline and a translucent selection surface in a separate depth pass, maintaining selection's own surface depth. Picking prioritizes selected overlay geometry, including body-surface pieces. Selecting a hidden study list item reveals that item's pieces while retaining other hide history (supersedes the earlier hidden-selection behavior).

Single-click selects an individual mesh; double-click or double-tap the same mesh within 350 ms focuses it in context. Dragging, cancellation, different pieces, and distant/slow taps do not focus. List double-click focuses its named concept. Explicit Focus selection buttons support keyboard use. Focus ends when returning from isolation or changing the explosion amount; changes of study scope/focus invalidate framing independently of reset counters. Wheel zoom follows the cursor using the installed OrbitControls capability.

## Expanded regional coverage
User requested whole-body regional navigation after testing the initial three collections. The catalog now contains seven group overviews and 27 subdivisions, with explicit atlas memberships, suitable initial views, and notes for limited source anatomy. This is practical study navigation; boundaries can overlap and the atlas does not model every anatomical structure.
