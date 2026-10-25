This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

# Maze

<!-- BADGER:BEGIN_INSERTION -->

[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![XState](https://img.shields.io/badge/XState-5.20.0-121212?style=flat-square&logo=xstate)](https://xstate.js.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Howler](https://img.shields.io/badge/Howler-2.2.4-FF6B6B?style=flat-square&logo=javascript)](https://howlerjs.com)

<!-- BADGER:END_INSERTION -->

## Algorithms for maze generation

Welcome! This repo is where I work on my passion for creating mazes with code.

It is a work in progress and I welcome contributors of ideas, comments, or code.

View the latest deployed version of this app [here](https://mazes.vercel.app/)!

Thanks for visiting!

## Getting Started

Install Node.js 24 LTS (the patch release is pinned in `.nvmrc`) and Bun 1.4.4.
Bun manages packages and scripts; Next.js, Vite, and Vitest run on Node.js.

```bash
nvm install
nvm use
bun install --frozen-lockfile
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/pages/index.ts`. The page auto-updates as you edit the file.

## TypeScript baseline

The project uses TypeScript 5.9.3 with an ES2022 target, bundler module
resolution, explicit type imports, checked indexed access, and the `@/*` alias
for `src/*` in both Next.js and Vitest.

[TypeScript 7.0 is released](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/),
but its native compiler does not expose the JavaScript compiler API required by
Next.js 15.5.9 (`readConfigFile` / `createProgram`) and
prettier-plugin-organize-imports 4.3.0 (`createLanguageService`). TypeScript 6.0.3
is available, but the installed
[typescript-eslint 8.50.1 parser requires TypeScript below 6](https://github.com/typescript-eslint/typescript-eslint/blob/v8.50.1/packages/typescript-estree/package.json).
Keep 5.9.3, the latest compatible 5.x release, as the single compiler for
`bun run typecheck`, builds, linting, and formatting until those tools are upgraded.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
