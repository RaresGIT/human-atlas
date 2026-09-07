# Study expansion implementation plan

**Goal:** Implement all approved exploration, learning, revision, sharing and cutaway improvements on dev.
**Architecture:** Keep the batched Three renderer. Add pure validated workspace/storage helpers, focused study panels, and a sourced content catalog. Preserve existing Explorer and quiz APIs where practical.
**Spec:** The user approved all 10 table features, structure cards, guided lessons, cutaways, and revision import/export in conversation; additionally requires performance optimization.

## Constraints
- No female model; no backend/account requirement; no paid services.
- Preserve main production; publish verified work to dev preview.
- Anatomical facts require primary/educational institutional sources. Do not invent relationships from spatial proximity.
- Persist bounded, validated IDs and camera vectors, never geometry. Handle invalid imports without destroying saved data.
- Keyboard actions must ignore input controls. Cutaway picking/highlighting must agree with rendering.
- Avoid per-frame React state updates; retain shared batched geometry and idle rendering.

## Tasks and verification
- [x] Renderer: styles (solid/outline/xray), surrounding opacity, cut plane axis/position/invert, overlap chooser, camera snapshot/restore and PNG capture. Own scene.tsx/selection-highlight.ts/anatomy.ts; expose typed APIs. Validate shader compilation, clipping, camera roundtrip and idle behavior in browser.
- [x] Study foundation: searchable region/all-atlas list, bounded expandable groups, side filtering; history with focus/visibility undo-redo; shortcuts; workspace restore; scene library/share links/export; named study sets import/export. Pure validation script checks IDs, caps, malformed input, camera validation and history branching.
- [x] Practice/revision: session length/system/side, curated synonyms and spelling feedback/hints, assembled context-find with hide hint, scheduled review including correct attempts, revision export/import. Migrate v1 records. Test scoring, answer concealment, schedule, migrations and malformed imports.
- [x] Content: sourced structure cards for curated structures with explicit fallback elsewhere; guided multistep lessons with curated scene membership, explanation and practice handoff. Verify all IDs/source links and runtime cards.
- [x] Integrate panels: responsive controls, camera/style/cutaway options, sets/scenes/lessons and new quiz modes; render selection detail near top to reduce scrolling. Check mobile layout and all old validations.
- [x] Performance and final review: memoize atlas lookup, cap rendered search results, lazy render expanded lists; profile frame activity and production build. Run check, all validate scripts, build; review changes, commit and push dev, verify Vercel preview ready.

## Verification results
- TypeScript, all 11 validation scripts, production build and diff whitespace check passed on 2026-09-07.
- Browser checks: single/double selection, undo, exact camera persistence, library save/share/import, invalid-import preservation, lesson handoff, assembled practice/hide hint, spelling retry, correct/missed scheduling and 320×568 / 844×390 layouts.
- Renderer checks: shader compilation, clipping-aware picking, annotation PNG, camera projection roundtrip and zero idle draw calls over 600 ms.
- Performance: cached indexes/visibility, bounded and lazy lists, debounced persistence, settled camera snapshots, separate cached React/Three chunks. Build gzip: app ~105 KB, React ~60 KB, Three ~123 KB; geometry download unchanged.
- Content coverage: 21 sourced cards and 3 guided lessons. Cutaways are uncapped surface meshes. Physical mobile hardware was not benchmarked.
- Final integration review fixed invalid grouped-selection restoration and inspection of structures excluded by the current side filter.
