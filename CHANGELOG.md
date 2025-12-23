# maze

## 1.0.27

### Patch Changes

- c7dd8cc: Update Vite and Vitest dependencies and fix build error
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
