# maze

## 1.1.1

### Patch Changes

- 75d8630: Upgrade development tooling and preserve release versioning for the private app. No user-facing changes.

## 1.1.0

### Minor Changes

- ec176ee: Migrate from Next.js to Vite.

### Patch Changes

- 2e5867b: Build the signed Version Packages commit on a temporary branch and move the release branch straight to it, so updating the release PR no longer closes it.
- 467cafe: Replace ESLint and Prettier with Biome for linting, formatting, and import organizing.
- 883d47a: Standardize on Node 24 LTS and a stricter TypeScript baseline with ES2022,
  bundler resolution, type-only imports, checked indexed access, and the @/ alias.
  Retain TypeScript 5.9.3 for compatibility with the current framework and tooling.
- c79065d: Run CI for development pull requests, maintain signed release commits, promote signed development commits to production, and group dependency updates after a seven-day cooldown.
- 9f8df1d: Reset the release branch to dev before adding the signed Version Packages commit, so the release pull request no longer conflicts with dev.
- 576fb6f: Add characterization tests for maze generation, state machines, and controls, enforced coverage thresholds, and Chromium smoke tests in CI.
- c621bb3: Migrate package management and scripts from pnpm to Bun while preserving dependency versions and the Node.js runtime.
- ffa8f18: Remove unused boilerplate, assets, dependencies, and exports; use the bundled use-sound types and stop tracking local configuration and build caches.
- f1044a9: Update Vite and Vitest dependencies and fix build error

  - Updated Vite from v5.4.21 to v6.4.1
  - Updated Vitest from v2.0.0 to v3.2.4
  - Updated @vitejs/plugin-react and @vitest/coverage-v8 to compatible versions
  - Updated Lucide icons to v0.562.0
  - Fixed build error by excluding vitest.config.ts from Next.js type checking

## 1.0.26

### Patch Changes

- 3e62864: Rename promote-to-main workflow to deploy for clarity

## 1.0.25

### Patch Changes

- 059dfb9: Add workflow to auto-merge dev to main after Version Packages PR is merged
- 129dc18: Remove unused dependencies and files identified by knip
- 3cebc17: Bump Vite version
- 8c1fac2: Delete redundant deploy-prod action workflow
- 5d8657b: Delete old workflow for deploying to prod
- dacdc75: Fix lock file
- ffe2ba9: Update Stately URL to Recursive Backtracker machine

## 1.0.24

### Patch Changes

- fecb153: Adding CI checks for code quality. Migrating from Yarn -> pnpm and Jest -> Vitest. Adding changesets and support for a new `feature branch` -> `dev` -> `main` release workflow supported by changesets.
- 96660b1: Fixing base branch for changesets so that the Version Packages PRs target the main branch and not the dev branch.
- 36c4fcc: Update Next.js to 15.5.7 and React to 19.2.1
