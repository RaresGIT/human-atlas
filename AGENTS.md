# Human Atlas

Static Vite + React + Three.js anatomy explorer and study app (fork of `ashemag/human-atlas`), deployed on Vercel at annatlas.com.

- [README.md](README.md): usage, local commands (`npm run dev`, `npm run check`, `npm run build`, `scripts/validate-*.mjs`).
- [docs/maintenance.md](docs/maintenance.md): deployment mapping, code map, storage keys, rendering details, prior decisions.

## Traps

- Pushing to `main` deploys production (annatlas.com); pushing to `dev` deploys the dev.annatlas.com preview. Both are deploys.
- `origin` is the fork `RaresGIT/human-atlas`; `upstream` is the original `ashemag/human-atlas`. Push and open PRs against `origin` only, never `upstream`.
- `docs/superpowers/` holds records of past work, not rules.
