# Releasing

This project uses [standard-version](https://github.com/conventional-changelog/standard-version) for versioning and changelog generation, and GitHub Actions for automated npm publishing.

## Prerequisites

1. **NPM_TOKEN secret** must be configured in GitHub repo settings:
   - Go to [npmjs.com](https://npmjs.com) → Access Tokens → Generate New Token (Automation)
   - GitHub repo → Settings → Secrets and variables → Actions → New repository secret
   - Name: `NPM_TOKEN`, Value: your npm token

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

- Check that `NPM_TOKEN` is set correctly in GitHub secrets
- Ensure the token has publish permissions
- For scoped packages, ensure `--access public` is used (already configured)

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
