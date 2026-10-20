# Contributing

## Setup

Requires Node 24 (see `.nvmrc`) and pnpm 10.

```bash
git clone https://github.com/fabroos/fadekit.git
cd fadekit
pnpm install
pnpm dev # builds the plugin, then starts the landing + playground
```

## Project structure

```
packages/fadekit/      the plugin (index.ts → dist/)
apps/playground/       landing page and in-browser playground
.changeset/            pending release notes
```

The playground imports the plugin from its TypeScript source, so edits to `packages/fadekit/index.ts` show up in the playground without a rebuild.

## Making changes

1. Branch off `main` and make your change.
2. Check it: `pnpm typecheck && pnpm build`, and try it in the playground.
3. If it affects the published package, add a changeset: `pnpm changeset` (patch for fixes, minor for features, major for breaking changes).
4. Open a pull request.

## Releasing

Releases are automated with Changesets and npm trusted publishing (OIDC), so there is no npm token in the repo:

1. When changesets land on `main`, the **Release** workflow opens a "Version Packages" PR that bumps versions and updates the changelog.
2. Merging that PR runs the **Publish** workflow, which publishes `fadekit` to npm with provenance.

One-time repository setup this relies on:

- npm: `fadekit` → Settings → Trusted publishing → GitHub Actions, repository `fabroos/fadekit`, workflow `publish.yml`.
- GitHub: Settings → Actions → General → enable "Allow GitHub Actions to create and approve pull requests" (for the version PR).
