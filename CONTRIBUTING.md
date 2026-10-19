# Contributing

Thank you for your interest in contributing to `fadekit`!

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 10.20.0+

### Installation

```bash
# Clone the repository
git clone https://github.com/fabroos/tailwindcss-better-gradient.git
cd tailwindcss-better-gradient

# Install dependencies
pnpm install
```

### Development Workflow

1. **Make your changes** in the appropriate package
2. **Test your changes**:

   ```bash
   # Build the package
   pnpm build:package

   # Test in playground
   pnpm dev
   ```

3. **Add a changeset**:

   ```bash
   pnpm changeset
   ```

   Select the package and describe your changes

4. **Format code**:

   ```bash
   pnpm format
   ```

5. **Type check**:
   ```bash
   pnpm typecheck
   ```

## Project Structure

```
.
├── packages/
│   └── fadekit/  # Main package
│       ├── index.ts                  # TypeScript source
│       ├── index.css                 # CSS-based plugin
│       ├── dist/                     # Compiled output
│       └── package.json
├── apps/
│   └── playground/                   # Demo app
└── .changeset/                       # Changeset files
```

## Making Changes

### Adding New Utilities

1. Edit `packages/fadekit/index.css` for CSS-based utilities
2. Edit `packages/fadekit/index.ts` for JavaScript plugin
3. Test in `apps/playground`
4. Update README.md if needed

### Adding Features

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make your changes
3. Add a changeset: `pnpm changeset`
4. Test thoroughly
5. Submit a pull request

## Code Style

- Use Prettier for formatting (configured in `.prettierrc`)
- Follow TypeScript best practices
- Write clear, descriptive commit messages
- Add comments for complex logic

## Testing

Before submitting:

```bash
# Build everything
pnpm build

# Type check
pnpm typecheck

# Format check
pnpm format:check

# Test in playground
pnpm dev
```

## Submitting Changes

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add a changeset**: `pnpm changeset`
5. **Commit your changes**: Use conventional commits
6. **Push to your fork**
7. **Create a Pull Request**

### Commit Message Format

Use conventional commits:

```
feat: add new fade-bg utility
fix: correct gradient calculation
docs: update README
chore: update dependencies
```

## Release Process

Releases are handled automatically via Changesets:

1. Changesets are added for each change
2. When ready, run `pnpm version` to update versions
3. Create a release PR
4. Merge the PR to publish

## Questions?

Feel free to open an issue for questions or discussions!
