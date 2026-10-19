# npm Publishing Setup Guide

## Current Setup: Publishing to npmjs.org (Public npm)

Your package `fadekit` is configured to publish to the **public npm registry** (`registry.npmjs.org`), not GitHub Packages.

## Required Setup

### 1. Create npm Access Token

1. Go to [npmjs.com](https://www.npmjs.com/) and log in
2. Click your profile → **Access Tokens**
3. Click **Generate New Token** → **Automation** (or **Classic**)
4. Give it a name like "GitHub Actions Publishing"
5. Copy the token (you won't see it again!)

### 2. Add Token to GitHub Secrets

1. Go to your repository: `https://github.com/fabroos/tailwindcss-better-gradient/settings/secrets/actions`
2. Click **New repository secret**
3. Name: `NPM_TOKEN`
4. Value: Paste your npm token
5. Click **Add secret**

### 3. Verify Package Configuration

Your `package.json` should have:

```json
{
  "name": "fadekit",
  "version": "0.0.8",
  "publishConfig": {
    "access": "public"
  }
}
```

**Note:** The `publishConfig.access: "public"` ensures the package is published as public (not private).

## Workflow Authentication

The GitHub Actions workflow uses:

- `NPM_TOKEN` secret for npmjs.org authentication
- `GITHUB_TOKEN` for GitHub API (creating PRs, etc.)

## Alternative: GitHub Packages

If you want to publish to **GitHub Packages** instead (npm.pkg.github.com):

### Changes Needed:

1. **Update package.json:**

   ```json
   {
     "name": "@fabroos/fadekit",
     "publishConfig": {
       "registry": "https://npm.pkg.github.com"
     }
   }
   ```

2. **Update workflow:**
   - Use `GITHUB_TOKEN` instead of `NPM_TOKEN`
   - Change registry URL to `https://npm.pkg.github.com`

3. **Create .npmrc in package:**
   ```
   @fabroos:registry=https://npm.pkg.github.com
   ```

### Pros/Cons:

**npmjs.org (Current):**

- ✅ Public, discoverable on npm
- ✅ Standard npm registry
- ✅ Works with all npm tools
- ❌ Requires separate npm account/token

**GitHub Packages:**

- ✅ Integrated with GitHub
- ✅ Can use GITHUB_TOKEN
- ✅ Free for public packages
- ❌ Less discoverable
- ❌ Requires scoped package name (@fabroos/...)
- ❌ Users need to configure .npmrc to install

## Current Configuration (npmjs.org)

Your workflow is configured for npmjs.org:

- Registry: `https://registry.npmjs.org`
- Token: `NPM_TOKEN` secret
- Package: `fadekit` (unscoped)

## Troubleshooting

### Error: "E404 Not Found"

- **Cause:** npm can't authenticate or package doesn't exist
- **Fix:** Ensure `NPM_TOKEN` is set correctly in secrets

### Error: "You do not have permission"

- **Cause:** Token doesn't have publish permissions
- **Fix:** Regenerate token with correct permissions

### Error: "Package name already exists"

- **Cause:** Someone else owns the package name
- **Fix:** Use a scoped name like `@fabroos/fadekit`

## Verification

After setting up `NPM_TOKEN`, the workflow should:

1. ✅ Authenticate to npmjs.org
2. ✅ Build the package
3. ✅ Publish successfully
4. ✅ Create release PR (if using changesets)

## References

- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [GitHub Actions npm Authentication](https://docs.github.com/en/actions/publishing-packages/publishing-nodejs-packages)
- [GitHub Packages npm Guide](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)








