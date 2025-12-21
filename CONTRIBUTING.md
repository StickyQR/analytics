# Contributing to @stickyqr/analytics

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- TypeScript knowledge
- Familiarity with analytics/tracking concepts

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/StickyQR/analytics.git
cd analytics

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Start development mode (watch)
npm run dev
```

## Project Structure

```
analytics/
├── src/
│   ├── core/           # Core Analytics and Queue classes
│   ├── plugins/        # Built-in plugins
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Utility functions
├── examples/           # Usage examples
├── dist/               # Compiled output (git ignored)
└── docs/               # Documentation
```

## Development Workflow

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Changes

- Write clean, readable code
- Follow existing code style
- Add TypeScript types for all new code
- Update documentation as needed

### 3. Test Your Changes

```bash
# Run tests
npm test

# Lint code
npm run lint

# Build to check for errors
npm run build
```

### 4. Commit Your Changes

We use conventional commits:

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve issue with storage"
git commit -m "docs: update README"
git commit -m "refactor: improve queue performance"
git commit -m "test: add tests for Analytics class"
```

**Commit types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Code Style Guidelines

### TypeScript

- Use strict TypeScript types
- Avoid `any` unless absolutely necessary
- Export types for public APIs
- Use interfaces for object shapes

```typescript
// ✅ Good
interface UserTraits {
  email: string;
  name: string;
  plan?: string;
}

function identify(userId: string, traits: UserTraits): void {
  // ...
}

// ❌ Bad
function identify(userId: any, traits: any) {
  // ...
}
```

### Naming Conventions

- **Classes**: PascalCase (`Analytics`, `ConsoleLoggerPlugin`)
- **Functions**: camelCase (`identify`, `getDefaultContext`)
- **Constants**: UPPER_SNAKE_CASE (`DEFAULT_CONFIG`)
- **Files**: kebab-case (`device-enrichment.ts`)

### Code Organization

- One class per file
- Group related functions
- Keep files under 500 lines
- Extract complex logic into utilities

### Comments

```typescript
/**
 * Track a custom event
 * @param eventName - Name of the event
 * @param properties - Event properties
 * @param options - Additional options
 */
async track(
  eventName: string,
  properties?: EventProperties,
  options?: EventOptions
): Promise<void> {
  // Implementation
}
```

## Testing

### Writing Tests

Create test files with `.test.ts` suffix:

```typescript
// storage.test.ts
import { Storage } from '../utils/storage';

describe('Storage', () => {
  it('should store and retrieve values', () => {
    const storage = new Storage();
    storage.set('key', 'value');
    expect(storage.get('key')).toBe('value');
  });

  it('should handle JSON serialization', () => {
    const storage = new Storage();
    const obj = { foo: 'bar' };
    storage.set('obj', obj);
    expect(storage.get('obj')).toEqual(obj);
  });
});
```

### Run Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- storage.test.ts

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Creating Plugins

Plugins extend the SDK functionality. Here's how to create one:

### Plugin Template

```typescript
import { Plugin, AnalyticsEvent } from '../types';

export class MyPlugin implements Plugin {
  name = 'my-plugin';
  type: 'enrichment' = 'enrichment'; // or 'before' | 'destination' | 'after'
  version = '1.0.0';

  private loaded = false;

  isLoaded(): boolean {
    return this.loaded;
  }

  async load(): Promise<void> {
    // Initialize your plugin
    this.loaded = true;
  }

  // Implement event handlers
  async track(event: TrackEvent): Promise<TrackEvent | null> {
    // Modify or process the event
    return event;
  }

  // Optionally implement: identify, page, screen, alias, group
}
```

### Plugin Best Practices

1. **Handle errors gracefully** - don't throw, return null
2. **Don't block** - use fire-and-forget for external calls
3. **Check availability** - verify APIs exist before using
4. **Document configuration** - provide clear examples
5. **Test thoroughly** - test in different environments

## Documentation

### Update Documentation

When adding features:

1. Update `README.md` with new API
2. Add examples to `examples/`
3. Update `PLUGIN_GUIDE.md` if relevant
4. Add JSDoc comments to public APIs

### Documentation Standards

- Use clear, concise language
- Provide code examples
- Include use cases
- Document edge cases
- Keep up-to-date with code

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass (`npm test`)
- [ ] Linter passes (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Documentation updated
- [ ] Commit messages follow convention

### PR Description

Include:
- **What** changed
- **Why** it's needed
- **How** it works
- **Testing** done
- Screenshots if UI-related

Example:
```markdown
## Description
Adds support for automatic screen tracking in React Native

## Motivation
Users requested easier screen tracking without manual calls

## Changes
- Added `useScreenTracking` hook
- Updated context to collect app info
- Added React Native example

## Testing
- Tested on Expo 54
- Verified on iOS and Android
- Added unit tests

## Screenshots
[If applicable]
```

### PR Review Process

1. Maintainer reviews code
2. Address feedback
3. Update if needed
4. Approved and merged

## Issue Guidelines

### Reporting Bugs

Use the bug report template:

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Initialize analytics with...
2. Call track() with...
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- SDK Version: 1.0.0
- Platform: Web/React Native/Node.js
- Browser/Node Version:
- OS:

**Additional Context**
Any other relevant information
```

### Feature Requests

```markdown
**Feature Description**
What feature you'd like

**Use Case**
Why you need it

**Proposed Solution**
How it could work

**Alternatives Considered**
Other approaches you thought of
```

## Release Process

### Versioning

We use [Semantic Versioning](https://semver.org/):

- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features (backward compatible)
- **Patch** (1.0.0 → 1.0.1): Bug fixes

### Publishing (Maintainers Only)

```bash
# Update version
npm version patch|minor|major

# Build
npm run build

# Publish to npm
npm publish

# Push tags
git push --tags
```

## Code of Conduct

### Our Standards

- Be respectful and inclusive
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Publishing private information
- Unprofessional conduct

### Enforcement

Violations may result in:
1. Warning
2. Temporary ban
3. Permanent ban

Report issues to: conduct@stickyqr.com

## Getting Help

- **Documentation**: See README.md and guides
- **Issues**: Search existing issues first
- **Discussions**: Use GitHub Discussions for questions
- **Email**: support@stickyqr.com

## Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Added to GitHub contributors

Thank you for contributing! 🎉

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
