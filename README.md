# Human Atlas

An interactive 3D anatomy explorer built with React, Three.js, and shadcn/ui. Take the BodyParts3D adult male reference apart into **2,234 individually selectable meshes**, explore **15 anatomical systems**, and search **3,432 named concepts**.

**[Explore the live demo](https://human-atlas-seven.vercel.app)**

## Explore

- Orbit, zoom toward the cursor, and select structures directly on the body.
- Single-click to highlight a piece; double-click or double-tap to focus it without hiding the surrounding anatomy.
- Toggle individual systems or use skeleton and organ presets.
- Move from assembled anatomy to a spaced inventory of every visible piece.
- Search anatomical names and source identifiers.
- Isolate a selected structure and read its details.
- Use compact controls and detail panels on mobile.

## Study anatomy

Choose **Study** to open the regional workspace. Choose from **34 regions in seven groups**: head and neck, back, thorax, abdomen, pelvis and perineum, upper limb, and lower limb. Each group offers an overview and focused subdivisions, such as the elbow, forearm, wrist and hand, knee, or ankle and foot. Collections cover 149 named concepts and 1,228 modeled pieces. Membership reflects available atlas anatomy; coverage notes identify sparse regions. Joint collections retain whole contextual bones.

1. **Choose a region.** The camera frames its anatomy. System checkboxes filter the collection; click a structure in the list or model to inspect it.
2. **Explore relationships.** Pin up to six labels, toggle labels, hide selected pieces, and use **Undo hide** or **Restore all**. Selecting a hidden list item reveals its pieces. Selected structures have a contrasting outline and are shown through surrounding anatomy in both viewers. Double-click/double-tap a piece or choose **Focus selection** for a close-up in context; wheel zoom follows the cursor. The patient compass follows the camera: R/L = right/left, A/P = anterior/posterior, S/I = superior/inferior.
3. **Practice.** Use **Name a structure** to type the atlas name of a highlighted concept, or **Find a structure** to pick it from separated concepts. Multi-piece concepts remain together in the finding view; any member piece counts. Labels and inspection are suppressed during questions. Case, spacing and punctuation do not affect naming answers. Reveal, advance, or end a session at any time.
4. **Review mistakes.** Incorrect and revealed answers enter **Revision**, with one miss recorded per answered question. Retry naming/finding, inspect a saved structure, or **Mark reviewed** to remove it. Correct retries do not remove items automatically. Revision is saved in this browser, without an account or synchronization; if storage is unavailable, it remains in memory while the workspace is open.

The original explorer remains available through **Explorer**. Structure descriptions retain the existing distinction between dedicated explanations and general system context.

## Run locally

Requires Node.js 22.13 or newer. No API keys or accounts are needed.

```sh
npm ci
npm run dev
```

Open http://localhost:3016. To build the static site, run `npm run build`; the output is in `dist/`.

## Validate

```sh
npm run check
node scripts/validate-atlas.mjs
node scripts/validate-interactions.mjs
node scripts/validate-study-regions.mjs
node scripts/validate-study.mjs
node scripts/validate-study-quiz.mjs
node scripts/validate-study-revision.mjs
node scripts/validate-selection-gestures.mjs
npm run build
```

Validation covers mesh buffers, names and concept membership, nonoverlapping exploded layouts at desktop and mobile aspect ratios, search and inspection contracts, and tap-versus-drag handling. Browser interaction checks have exercised selection, system controls, search, isolation, rotation, and 390×844, 320×568, and 844×390 layouts. Phone controls stay clear of the exploded inventory, and isolated structures fit the space above or beside the detail panel. Physical-device performance and real multitouch hardware have not been tested.

## Anatomy data

The current viewer uses **BodyParts3D 4.0**, an adult male reference anatomy, licensed **CC BY 4.0**. It does not represent every human structure or variation. Individual source meshes are distinct from named concepts, which may group multiple meshes. Descriptions distinguish general system context from individual organ explanations.

Geometry is simplified for browser performance while retaining every source mesh. The packaged model contains 2,288,268 triangles and downloads approximately 33 MB of compressed geometry. Full credits, source links, and adaptation details are in [ATTRIBUTION.md](public/ATTRIBUTION.md).

This is an educational explorer, not a diagnostic or surgical tool.

## How it works

Geometry is merged into batches. Per-structure GPU textures control translation, visibility, and selection, while component geometry supports accurate picking. Exploded layouts pack only the visible pieces. Rendering updates when the scene changes; orbit controls remain responsive without thousands of separate draw calls.

The optional WebMCP tools expose anatomy search and inspection in compatible browsers. The visible interface works without them.

## Rebuilding geometry

The repository includes browser-ready geometry. Rebuilding it is optional: obtain the official BodyParts3D OBJ archive and English metadata tables, prepare the joined concepts and display-system mappings, run `scripts/convert-anatomy.py`, then `node scripts/optimize-anatomy.mjs` and `node scripts/compress-models.mjs`. Simplification uses a 0.2% relative error limit per structure.

## Deploy

This fork uses the Vercel `human-atlas` project connected to `RaresGIT/human-atlas`:

- `main` is the production branch for `annatlas.com`.
- `dev` creates preview deployments for `dev.annatlas.com`. Push development changes here to test them before merging into `main`.
- The development subdomain must have a CNAME to the target shown in Vercel project domain settings.


Import this repository into Vercel as a Vite project. The included `vercel.json` configures `npm ci`, `npm run build`, and the `dist` output directory. It can also be served by a static host.

## License

Original application code is released under the [MIT License](LICENSE). **The anatomy data has its own CC BY 4.0 license**; preserve the attribution when redistributing it. Third-party dependencies retain their respective licenses.

Issues and pull requests are welcome. Please include reproduction steps and browser/device details for interaction problems.
