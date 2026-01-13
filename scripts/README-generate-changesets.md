# Generate Changesets from Knope

This script generates changeset files for version management.

It runs `knope release --dry-run` after temporarily modifying `knope.toml` to set `ignore_conventional_commits = false`, then parses the output to create changeset files, and finally restore the original configuration.

## Usage

### CLI

```bash
node scripts/generate-changesets-from-release.js [options]
```

### Options

- `--changesets-dir, -c` - Path to .changeset directory (default: `./.changeset`)
- `--packages-dir, -p` - Path to packages root (default: current directory)
- `--knope-config, -k` - Path to knope.toml (default: `./knope.toml`)
- `--help` - Show help message

### Examples

```bash
# Generate changesets from knope dry-run (default)
pnpm run release:changesets

# Run directly
node scripts/generate-changesets-from-release.js

# Specify custom paths
node scripts/generate-changesets-from-release.js --changesets-dir ./.changeset --packages-dir .
```

## What it does

1. **Modifies knope.toml** - Temporarily sets `ignore_conventional_commits = false` for all packages
2. **Runs knope dry-run** - Executes `knope release --dry-run` to get release output
3. **Restores knope.toml** - Sets `ignore_conventional_commits` back to original values
4. **Scans package directories** - Automatically discovers packages from `package.json` files
5. **Parses knope output** - Extracts package version and changelog information
6. **Groups changelog items** - Deduplicates changelog entries across packages
7. **Creates changesets** - Generates proper changeset files

## Changeset Format

Each generated changeset follows this format:

```markdown
---
"@lumeweb/package-name": minor
"@lumeweb/another-package": patch
---

## Features

Feature description 1
Feature description 2

## Breaking Changes

Breaking change description
```

## Change Type Determination

The script automatically determines the change type based on changelog content:

- **major** - If changelog contains "Breaking Changes"
- **minor** - If changelog contains "Features"
- **patch** - Otherwise (fixes, etc.)

## Example Workflow

```bash
# 1. Generate changesets directly from knope
pnpm run release:changesets

# 2. Review and edit changesets as needed
# Edit files in .changeset/

# 3. Commit and push
git add .
git commit -m "chore: prepare release"
git push

# 4. Run knope release to apply versions and generate changelogs
knope release

# 5. Publish packages
pnpm publish:npm
```

## Notes

- The script automatically discovers packages from `package.json` files in common directories (`libs`, `apps`, `packages`)
- Packages with identical changelog content will be grouped into a single changeset
- All generated changesets use proper formatting
- Manual review is recommended after generation to ensure accuracy

## Reusability Features

1. **Configurable paths** - All paths can be customized via CLI arguments
2. **Automatic package discovery** - Scans directories for `package.json` files
3. **Safe config modification** - Temporarily and safely modify knope.toml
4. **Deduplication** - Automatically groups identical changelog content
5. **Proper changeset formatting** - Creates properly formatted changeset files
