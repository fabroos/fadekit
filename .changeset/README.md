# Changesets

This directory contains changeset files that describe changes made to packages in this monorepo.

## Quick Start

**Create a changeset:**

```bash
pnpm changeset
```

Select package → Select type (patch/minor/major) → Describe change → Done!

See [QUICK_START.md](./QUICK_START.md) for detailed examples.

## What are Changesets?

Changesets are a way to document changes to packages. They help with:

- Version management
- Changelog generation
- Release planning

## How to Use

### Adding a Changeset

When you make changes that should be released:

```bash
pnpm changeset
```

This will:

1. Ask which packages changed
2. Ask what type of change (major/minor/patch)
3. Ask for a description of the change
4. Create a changeset file in `.changeset/`

### Example Changeset

After running `pnpm changeset`, you'll be prompted to describe your changes. The generated file will look like:

```markdown
---
'fadekit': patch
---

Fix gradient stop calculation for better smoothness
```

### Versioning

When ready to release:

```bash
# Update versions based on changesets
pnpm version

# This will:
# 1. Update package.json versions
# 2. Generate/update CHANGELOG.md
# 3. Remove used changeset files
```

### Publishing

After versioning:

```bash
# Build and publish
pnpm release

# Or manually:
cd packages/fadekit
npm publish --access public
```

## Changeset Types

- **major**: Breaking changes
- **minor**: New features, backward compatible
- **patch**: Bug fixes, patches

## Best Practices

1. **Add changesets for every change** that affects users
2. **Be descriptive** in your changeset messages
3. **Group related changes** in a single changeset
4. **Review changesets** before versioning
