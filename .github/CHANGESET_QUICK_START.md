# Quick Start: Creating Changesets

## TL;DR

```bash
pnpm changeset
```

That's it! Follow the prompts.

## Step-by-Step

1. **Run the command:**

   ```bash
   pnpm changeset
   ```

2. **Select package:**
   - Choose `fadekit`

3. **Select change type:**
   - `patch` - Bug fixes, patches (0.0.9 → 0.0.10)
   - `minor` - New features, backward compatible (0.0.9 → 0.1.0)
   - `major` - Breaking changes (0.0.9 → 1.0.0)

4. **Describe the change:**
   - Write a brief description (e.g., "Fix gradient calculation")

5. **Done!**
   - A changeset file is created in `.changeset/`
   - Commit and push
   - Release workflow will create version PR automatically

## Examples

**Bug fix:**

```bash
pnpm changeset
# Select: patch
# Description: "Fix fade-bg direction calculation"
```

**New feature:**

```bash
pnpm changeset
# Select: minor
# Description: "Add fade-bg-steps-24 utility"
```

**Breaking change:**

```bash
pnpm changeset
# Select: major
# Description: "Rename fade-bg to fade (breaking)"
```

## What Happens Next?

1. ✅ Changeset file created in `.changeset/`
2. ✅ Commit and push to `main`
3. ✅ Release workflow detects changesets
4. ✅ Creates version PR automatically
5. ✅ Merge version PR → publishes to npm

## Tips

- **One changeset per PR** - Add it when you open the PR
- **Be descriptive** - Helps with changelog generation
- **Group related changes** - One changeset for related features
