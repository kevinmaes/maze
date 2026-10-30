# Maze

<!-- BADGER:BEGIN_INSERTION -->

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![XState](https://img.shields.io/badge/XState-5.20.0-121212?style=flat-square&logo=xstate)](https://xstate.js.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Howler](https://img.shields.io/badge/Howler-2.2.4-FF6B6B?style=flat-square&logo=javascript)](https://howlerjs.com)

<!-- BADGER:END_INSERTION -->

## Algorithms for maze generation

Welcome! This repo is where I work on my passion for creating mazes with code.

It is a work in progress and I welcome contributors of ideas, comments, or code.

View the latest deployed version of this app [here](https://mazes.vercel.app/)!

Thanks for visiting!

## Getting Started

Install Node.js 24 LTS (the patch release is pinned in `.nvmrc`) and Bun 1.4.4.
Bun manages packages and scripts; Vite and Vitest run on Node.js.

```bash
nvm install
nvm use
bun install --frozen-lockfile
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Start editing in `src/components/App/App.tsx`. Vite hot-reloads the page as you edit.

| Script            | Purpose                      |
| ----------------- | ---------------------------- |
| `bun run dev`     | Vite dev server on port 3000 |
| `bun run build`   | Production build to `dist/`  |
| `bun run preview` | Serve `dist/` on port 3000   |

## TypeScript baseline

The project uses TypeScript 6.0.3 with an ES2022 target, bundler module
resolution, explicit type imports, checked indexed access, and the `@/*` alias
for `src/*` in both Vite and Vitest.

[TypeScript 7.0 is released](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/),
but its native compiler does not provide the existing JavaScript compiler API.
SVGR still depends on `cosmiconfig` 8, whose TypeScript configuration loader uses
`transpileModule`, so this project keeps the TypeScript 6 compiler and API together.
Revisit TypeScript 7 when that loader no longer needs the legacy API. Knip 6 uses
Oxc, the Vite plugins do not need the compiler API, and Vitest typechecking is
disabled; `bun run typecheck` runs `tsc --noEmit` separately. Biome handles linting,
formatting, and import organization independently of the TypeScript compiler.

## Deploy on Vercel

Vercel builds with the Vite preset (`vercel.json`): `bun run build`, output `dist/`.
