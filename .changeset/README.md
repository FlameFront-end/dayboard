# Changesets

This folder stores release notes for pending version bumps.

Create a changeset for user-facing or release-worthy changes:

```bash
npx changeset
```

When merged to `main`, GitHub Actions will open or update a release PR.
After that PR is merged, the release workflow will:

- bump the version
- create a git tag
- build the Windows installer
- publish a GitHub Release with the generated artifacts
