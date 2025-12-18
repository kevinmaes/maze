# Deployment Workflow

This project uses a release train pattern for deployments with the following branches:

## Branch Strategy

- **`main`** - Production branch (only deployed via release PRs)
- **`dev`** - Development branch (auto-deployed, aggregates features)
- **`feature/*`** - Feature branches (preview deployments)
- **`release/*`** - Temporary release branches (preview deployments)

## Deployment Flow

1. **Feature Development**
   - Create feature branch from `dev`
   - Push changes → Vercel creates preview deployment
   - Create PR against `dev` branch

2. **Development Integration**
   - Merge feature PR to `dev`
   - Vercel automatically deploys `dev` branch
   - Create changeset: `pnpm changeset`

3. **Release Process**
   - Push to `dev` with changesets
   - GitHub Action creates release PR from `dev` to `main`
   - Release branch gets preview deployment in Vercel

4. **Production Deployment**
   - Review and merge release PR to `main`
   - Vercel automatically deploys to production

## Commands

```bash
# Create a changeset
pnpm changeset

# Create a feature branch
git checkout -b feature/my-feature dev

# Push to dev (triggers release PR creation)
git push origin dev
```

## Benefits

- ✅ Preview deployments for all branches
- ✅ Controlled production deployments
- ✅ Batch multiple features into single releases
- ✅ Full deployment history and rollback capability
