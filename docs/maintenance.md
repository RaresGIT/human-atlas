# Deployment and codebase notes

## Deployment

Configuration established on 2026-09-07:

- Fork: `RaresGIT/human-atlas` (`origin`); original: `ashemag/human-atlas` (`upstream`).
- Vercel Hobby project: `human-atlas`, under `raresgits-projects`, connected to the fork.
- Git pushes to `main` deploy to `annatlas.com`; `www.annatlas.com` redirects to the apex.
- Git pushes to `dev` create previews assigned to `dev.annatlas.com`. This branch contains the latest study expansion; production may lag behind it.
- The dev DNS record is `CNAME dev → 98f8286f5be180b2.vercel-dns-017.com`. Vercel's domain settings are the reference if this changes. The domain is assigned specifically to Git branch `dev`.
- Preview protection currently requires Vercel login. A redirect to Vercel sign-in is distinct from a DNS or build failure.

[vercel.json](../vercel.json) runs `npm ci` and `npm run build`, publishing `dist/`. This is a static Vite app with no app secrets, API server, or database. Other static hosts can serve the same output.

The Vercel CLI was installed and authenticated locally during setup; that login and the ignored `.vercel/` project link do not travel with the repository. On another machine, `vercel login` and `vercel link` connect to the existing project. `vercel ls` lists deployments; `vercel inspect <deployment-url> --wait` reports build status and aliases. Git deployment already handles ordinary branch pushes.

## Where things live

Paths below are relative to the repository root.

| Area | Files |
| --- | --- |
| Actual browser entry and build | `web/main.tsx`, `vite.config.ts` — `app/` is source organization, not a Next.js runtime |
| Explorer and shared types | `app/page.tsx`, `app/anatomy.ts` |
| Three.js rendering, picking, camera | `app/scene.tsx`; helpers: `selection-highlight.ts`, `renderer-state.ts`, `pointer-tap.ts`, `explosion-layout.ts` in `app/` |
| Study integration and regions | `app/study-workspace.tsx`, `app/study-regions.ts`, `app/study-model.ts` |
| Search, saved views, history, sets | `app/workspace-model.ts`, `app/use-workspace.ts`, `app/use-scene-history.ts`, `app/study-browser.tsx`, `app/study-library.tsx` |
| Practice and revision | `app/study-quiz.ts`, `app/study-practice.tsx`, `app/study-revision.ts`, `app/study-revision-panel.tsx` |
| Sourced cards and lessons | `app/anatomy-content.ts`, `app/structure-card.tsx`, `app/guided-lessons.tsx` |
| Styling and view controls | `app/globals.css`, `app/study.css`, `app/view-tools.tsx` |
| Packaged anatomy and downloads | `public/models/atlas.json`, `public/models/body-*.bin[.gz]`, `app/model-download.ts` |

## Useful context

- Atlas concepts can group several selectable meshes. Region membership, search results, and mesh IDs are different things. The 34 curated study regions cover a subset of the full atlas.
- Selection is visible through surrounding anatomy; a single click selects and a double click focuses. Explode arranges visible pieces into a spaced inventory. Cutaways clip surface meshes and leave open edges.
- Browser storage keys are `human-atlas.workspace.v1`, `human-atlas.library.v1`, and `human-atlas.revision.v1`. Revision payloads are now version 2 despite the unchanged key. Storage is separate for localhost, dev, and production; library/revision exports transfer data between them.
- Shared scenes use a `#scene=` URL fragment. They carry the view, not the study library or review history. Camera snapshots include a projection offset for panel-aware framing.
- Geometry is batched, lookup indexes cached, lists paginated, and saves debounced. Camera callbacks fire after settling; idle scenes avoid redraws. React and Three.js have separate cacheable bundles. The initial compressed geometry is still about 33 MB; physical-phone performance has not been benchmarked.
- Model downloads inspect gzip magic bytes because hosts may already decompress responses. Both compressed and raw geometry are packaged; rebuilding geometry is unnecessary for ordinary UI work.
- The model is BodyParts3D 4.0 adult male, with separate [CC BY 4.0 attribution](../public/ATTRIBUTION.md). A female toggle was deferred because comparable anatomical richness was not established. Current teaching content is 21 sourced cards and 3 lessons, with explicit fallback context elsewhere.

Local commands and validation are in the [README](../README.md#run-locally). `npm run check` checks types; `scripts/validate-*.mjs` cover data and behavior contracts; `npm run build` checks the production bundle. Shader, picking, camera and responsive-layout behavior also benefit from browser checks. Earlier design/implementation records live in `docs/superpowers/`; they describe past work rather than additional project rules.
