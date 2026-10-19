# Setting Up npm Trusted Publishing (OIDC)

This guide explains how to configure npm trusted publishing for secure, token-free package publishing from GitHub Actions.

## What is Trusted Publishing?

Trusted publishing uses OpenID Connect (OIDC) to authenticate npm publishes directly from your CI/CD workflows. This eliminates the need for long-lived npm tokens and provides:

- ✅ **More secure**: Short-lived, workflow-specific credentials
- ✅ **No token management**: No need to store NPM_TOKEN secrets
- ✅ **Automatic provenance**: Cryptographic proof of package origin
- ✅ **Industry standard**: Implements OpenSSF Trusted Publishers spec

## Prerequisites

- npm CLI version 11.5.1 or later (workflow automatically updates)
- GitHub Actions workflow (GitHub-hosted runners)
- Package published to npmjs.org

## Step 1: Configure Trusted Publisher on npmjs.com

1. Go to your package on npmjs.com: `https://www.npmjs.com/package/fadekit`
2. Click **Settings** (or go to package settings directly)
3. Scroll to **"Trusted Publisher"** section
4. Click **"GitHub Actions"** button
5. Fill in the form:
   - **Organization or user**: `fabroos`
   - **Repository**: `tailwindcss-better-gradient`
   - **Workflow filename**: `release.yml` (must include `.yml` extension)
   - **Environment name**: (leave empty unless using GitHub environments)
6. Click **"Add trusted publisher"**

**Important**: The workflow filename must match exactly, including the `.yml` extension!

## Step 2: Verify Workflow Configuration

The workflow is already configured with:

```yaml
permissions:
  id-token: write # Required for OIDC
  contents: write
  pull-requests: write
```

And includes:

- `npm install -g npm@latest` to ensure npm 11.5.1+
- No NPM_TOKEN secret needed

## Step 3: Test Publishing

1. Create a changeset:

   ```bash
   pnpm changeset
   ```

2. Commit and push:

   ```bash
   git add .
   git commit -m "chore: add changeset"
   git push
   ```

3. The changesets action will:
   - Create a version PR
   - When merged, automatically publish using OIDC
   - No NPM_TOKEN needed!

## Step 4: (Optional) Restrict Token Access

For maximum security, after verifying trusted publishing works:

1. Go to package Settings → **Publishing access**
2. Select **"Require two-factor authentication and disallow tokens"**
3. Click **"Update Package Settings"**

This disables traditional token publishing while keeping trusted publishers active.

## How It Works

1. **Workflow runs**: GitHub Actions generates an OIDC token
2. **npm detects OIDC**: npm CLI automatically detects the OIDC environment
3. **npm verifies**: npm checks the token against your trusted publisher config
4. **Publish succeeds**: Package is published with automatic provenance

## Troubleshooting

### Error: "Unable to authenticate"

**Check:**

- ✅ Workflow filename matches exactly (including `.yml`)
- ✅ Repository name matches exactly
- ✅ GitHub username/organization matches
- ✅ Using GitHub-hosted runners (not self-hosted)
- ✅ `id-token: write` permission is set

### Error: "npm version too old"

The workflow automatically updates npm, but if you see this:

- Ensure `npm install -g npm@latest` step runs before publish
- Check npm version: `npm --version` (needs 11.5.1+)

### Private Dependencies

If your package has private dependencies, you'll still need a read-only token for `npm install`:

```yaml
- run: pnpm install
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_READ_TOKEN }}
```

But `npm publish` will still use OIDC (no token needed).

## Benefits Over Token-Based Publishing

| Feature        | Token-Based      | Trusted Publishing (OIDC)  |
| -------------- | ---------------- | -------------------------- |
| Token lifetime | Long-lived       | Short-lived (per workflow) |
| Token storage  | GitHub Secrets   | None needed                |
| Security risk  | High (if leaked) | Low (can't be extracted)   |
| Provenance     | Manual           | Automatic                  |
| Token rotation | Manual           | Automatic                  |

## References

- [npm Trusted Publishing Docs](https://docs.npmjs.com/packages-and-modules/securing-your-code/trusted-publishing-with-oidc)
- [GitHub Actions OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [OpenSSF Trusted Publishers](https://github.com/ossf/wg-security-tooling/blob/main/trusted-publisher/spec.md)

## Migration from Token-Based Publishing

If you're currently using NPM_TOKEN:

1. **Set up trusted publisher** (Step 1 above)
2. **Verify it works** by publishing a test version
3. **Remove NPM_TOKEN** from GitHub secrets (optional)
4. **Restrict token access** in package settings (Step 4 above)
5. **Revoke old automation tokens** from npm account

This ensures a smooth transition without disrupting releases.








