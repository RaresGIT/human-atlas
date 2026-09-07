# Regional anatomy study implementation plan

**Goal:** Deliver region selection, spatial exploration, identification practice, and persistent revision in that order.

**Architecture:** A dedicated StudyWorkspace reuses AnatomyScene. Pure study modules own explicit region membership, visibility, answer matching, and revision validation. The original explorer launches the workspace and remains available on exit.

**Tech stack:** React, TypeScript, Three.js, existing CSS and Node validation scripts.

**Spec:** `docs/superpowers/specs/2026-09-07-regional-study-design.md` (implements the approved conversation scope).

**Constraints:** Keep changes on the feature branch; no new runtime dependencies, accounts, or unsupported anatomical content. Each region is a starter collection. Test meaningful behavior before implementing each stage; execute inline in order.

## 1. Regional workspace
- [x] Write `scripts/validate-study.mjs` assertions for resolvable region concept IDs, multiple systems, unique visible pieces, and scope/hidden precedence. Run it and observe failure before adding `app/study-model.ts`.
- [x] Define `StudyRegion {id, name, conceptIds}` and `regionConcepts(atlas, region)` in `app/study-model.ts`. Reject absent mappings via validation. Add optional scope/hidden/focus to SceneState and shared `isPartVisible(part, state)`.
- [x] Build `app/study-workspace.tsx`, with region selector, structure list, system filters and exit. Add launch in page.tsx. Frame scoped geometry in scene.tsx. Add responsive study CSS.
- [x] Run study validation and TypeScript check; test region switching and exit in the browser; commit stage.

## 2. Relationships
- [x] Extend validation with hide/undo history tests: hiding A then B, undoing once leaves A hidden, and reset clears both.
- [x] Add pin labels, show/hide labels, hide selected, undo and restore controls. Render concept labels at projected visible piece centers and a camera-aware patient compass in scene.tsx.
- [x] Validate controls in the browser, including labels hidden with geometry, phone layout and keyboard access; commit stage.

## 3. Identification
- [x] Add failing tests for normalized names, incorrect answers, member-piece acceptance and distinct question candidates.
- [x] Build pure quiz functions in `app/study-quiz.ts` and `app/study-practice.tsx` UI. Use controlled question state; naming isolates/highlights the concept, finding packs distinct candidate concepts with labels suppressed. Include check/reveal/next/end and summary.
- [x] Exercise incorrect and correct answers, reveal, completion, retry, and exit restoring exploration. Run validation/check/build; commit stage.

## 4. Revision
- [x] Add failing tests for duplicate mistakes, unknown IDs, malformed storage, invalid counts, and valid round trips.
- [x] Add `app/study-revision.ts` with validated versioned persistence and a revision tab listing missed concepts, mistake counts, inspect/remove and practice actions. Surface storage failures while retaining in-memory progress.
- [x] Test reload persistence and retry from revision; run existing atlas/interaction validation plus study tests, TypeScript and build. Review final diff and document usage in README. Commit stage and leave local server running.

## Approved follow-up
Expanded regional navigation to 34 entries in seven body groups with grouped selection, regional viewing directions, coverage notes, and catalog validation. Added selection visibility through occluders, single-click selection, double-click/tap focus, and cursor-centered zoom.
