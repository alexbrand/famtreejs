# Releasing

This project uses [standard-version](https://github.com/conventional-changelog/standard-version) for versioning and changelog generation, and GitHub Actions for automated npm publishing.

## Prerequisites

This project uses [npm trusted publishing](https://docs.npmjs.com/generating-provenance-statements#publishing-packages-with-provenance-via-github-actions) (OIDC) instead of access tokens. This is more secure because:
- No secrets to manage or rotate
- Publishing is cryptographically linked to this repository
- Packages show a verified "Published from GitHub Actions" badge on npm

### One-time setup

1. **Publish the package manually first** (required to create the package on npm):
   ```bash
   npm login
   npm publish --access public
   ```

2. **Link the package to GitHub Actions** on npmjs.com:
   - Go to [npmjs.com](https://npmjs.com) → Your package → Settings → Publishing access
   - Under "Require two-factor authentication or an automation or granular access token"
   - Add a new trusted publisher with:
     - **Environment**: `release` (or leave empty for any environment)
     - **Repository owner**: `alexbrand`
     - **Repository name**: `famtreejs`
     - **Workflow filename**: `release.yml`

After this setup, GitHub Actions can publish without any tokens.

## Commit Message Format

This project follows [Conventional Commits](https://www.conventionalcommits.org/). Your commit messages determine the version bump:

| Commit Type | Description | Version Bump |
|-------------|-------------|--------------|
| `fix:` | Bug fixes | Patch (0.1.0 → 0.1.1) |
| `feat:` | New features | Minor (0.1.0 → 0.2.0) |
| `BREAKING CHANGE:` | Breaking changes (in commit body) | Major (0.1.0 → 1.0.0) |
| `docs:`, `chore:`, `refactor:`, `test:`, `style:` | Other changes | No release |

### Examples

```bash
# Patch release
git commit -m "fix: prevent crash when data is empty"

# Minor release
git commit -m "feat: add horizontal orientation support"

# Major release
git commit -m "feat: redesign data model

BREAKING CHANGE: Partnership.partnerIds is now a tuple instead of array"
```

## Release Process

### Regular Release

```bash
# 1. Ensure you're on main with latest changes
git checkout main
git pull

# 2. Run the release command (auto-detects version from commits)
npm run release

# 3. Review the changes
git show HEAD
cat CHANGELOG.md

# 4. Push the commit and tag
git push --follow-tags
```

### First Release

For the initial release (v0.1.0), use:

```bash
npm run release:first
git push --follow-tags
```

### Specific Version Bump

To force a specific version bump:

```bash
npm run release -- --release-as patch   # Force patch
npm run release -- --release-as minor   # Force minor
npm run release -- --release-as major   # Force major
npm run release -- --release-as 1.0.0   # Force specific version
```

### Dry Run

To preview what will happen without making changes:

```bash
npm run release -- --dry-run
```

## What Happens Automatically

When you push a version tag (e.g., `v0.2.0`), GitHub Actions will:

1. Run lint, type-check, and tests
2. Build the package
3. Publish to npm
4. Create a GitHub Release with auto-generated release notes

## Troubleshooting

### "npm publish" fails with 403

- Verify trusted publishing is configured on npmjs.com (see Prerequisites)
- Check the workflow filename matches exactly: `release.yml`
- Ensure the repository owner and name match exactly
- For scoped packages, ensure `--access public` is used (already configured)

### "No matching signature" or OIDC errors

- The `id-token: write` permission must be set in the workflow
- The `--provenance` flag must be passed to npm publish
- GitHub Actions must be running on a public repository (or GitHub Enterprise with OIDC configured)

### Tag already exists

If the tag was created but the release failed:

```bash
# Delete the local tag
git tag -d v0.1.1

# Delete the remote tag
git push origin :refs/tags/v0.1.1

# Fix the issue and re-run
npm run release
git push --follow-tags
```

### Changelog looks wrong

Review and edit `CHANGELOG.md` before pushing:

```bash
npm run release
# Edit CHANGELOG.md if needed
git add CHANGELOG.md
git commit --amend --no-edit
git push --follow-tags
```
