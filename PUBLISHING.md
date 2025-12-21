# Publishing Guide

Complete guide for publishing `@stickyqr/analytics` to NPM and maintaining the repository.

## Prerequisites

### 1. NPM Account Setup

```bash
# Create account at https://www.npmjs.com/signup

# Login to npm
npm login

# Verify login
npm whoami
```

### 2. Organization Setup (Optional)

```bash
# Create organization at https://www.npmjs.com/org/create

# For scoped package @stickyqr/analytics
# The package name in package.json should be: "@stickyqr/analytics"
```

### 3. GitHub Repository Setup

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit"

# Create repository on GitHub
# Then push
git remote add origin https://github.com/stickyqr/analytics.git
git branch -M main
git push -u origin main
```

## Pre-Publish Checklist

Before publishing, ensure:

- [ ] All tests pass: `npm test`
- [ ] Linter passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] Version updated in `package.json`
- [ ] CHANGELOG.md updated
- [ ] README.md is accurate
- [ ] All examples work
- [ ] Documentation is complete

## Publishing to NPM

### First Time Publication

```bash
# 1. Ensure package.json is correct
# - name: "@stickyqr/analytics"
# - version: "1.0.0"
# - main, module, types fields set
# - files array includes "dist"

# 2. Build the package
npm run build

# 3. Test the package locally (optional)
npm pack
# This creates a tarball you can test with `npm install <tarball>`

# 4. Publish
npm publish --access public
```

### Subsequent Releases

```bash
# 1. Update version
npm version patch   # 1.0.0 -> 1.0.1 (bug fixes)
npm version minor   # 1.0.0 -> 1.1.0 (new features)
npm version major   # 1.0.0 -> 2.0.0 (breaking changes)

# 2. Build
npm run build

# 3. Publish
npm publish

# 4. Push tags to GitHub
git push --follow-tags
```

## Versioning Strategy

Follow [Semantic Versioning](https://semver.org/):

### Patch (1.0.x)
- Bug fixes
- Documentation updates
- Performance improvements
- Internal refactoring

```bash
npm version patch
```

### Minor (1.x.0)
- New features (backward compatible)
- New plugins
- API additions
- Deprecations (with warnings)

```bash
npm version minor
```

### Major (x.0.0)
- Breaking changes
- API removals
- Behavior changes
- Major rewrites

```bash
npm version major
```

## Release Process

### 1. Prepare Release

```bash
# Create release branch
git checkout -b release/1.1.0

# Update version
npm version minor

# Update CHANGELOG.md
# Add release notes

# Commit changes
git commit -am "chore: prepare release 1.1.0"

# Push for review
git push origin release/1.1.0
```

### 2. Review & Test

- Create Pull Request
- Run CI tests
- Manual testing
- Review by team

### 3. Merge & Tag

```bash
# Merge to main
git checkout main
git merge release/1.1.0

# Tag release
git tag v1.1.0

# Push
git push origin main --tags
```

### 4. Publish

```bash
# Build
npm run build

# Publish to NPM
npm publish

# Create GitHub Release
# Go to: https://github.com/stickyqr/analytics/releases/new
# - Tag: v1.1.0
# - Title: v1.1.0
# - Description: Copy from CHANGELOG.md
```

### 5. Post-Release

```bash
# Update develop branch
git checkout develop
git merge main

# Push
git push origin develop
```

## Automated Publishing (GitHub Actions)

### Setup NPM Token

1. Generate NPM token:
   - Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Create "Automation" token
   - Copy the token

2. Add to GitHub Secrets:
   - Go to repository Settings → Secrets → Actions
   - Add secret: `NPM_TOKEN`
   - Paste the token

### Publish via GitHub Release

```bash
# 1. Create and push tag
git tag v1.1.0
git push origin v1.1.0

# 2. Create GitHub Release
# Go to: https://github.com/stickyqr/analytics/releases/new
# - Select tag: v1.1.0
# - Click "Publish release"

# 3. GitHub Actions will automatically:
# - Run tests
# - Build package
# - Publish to NPM
```

## CHANGELOG.md Format

```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- New features

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security fixes

## [1.1.0] - 2024-12-20

### Added
- React Native support with AsyncStorage
- Platform detection utilities
- Expo integration examples

### Changed
- Storage now supports async operations
- Updated device detection with 30+ manufacturers

### Fixed
- Fixed browser detection for Chrome on iOS

## [1.0.0] - 2024-12-20

Initial release

### Added
- Core Analytics class
- Identity tracking (identify, alias)
- Event tracking (track)
- Page and screen tracking
- Queue system with retry logic
- Plugin architecture
- Built-in plugins (ConsoleLogger, GoogleAnalytics, DeviceEnrichment)
- TypeScript support
- Web, React Native, Node.js support
```

## NPM Package Maintenance

### View Package Info

```bash
# View package details
npm view @stickyqr/analytics

# View all versions
npm view @stickyqr/analytics versions

# View specific version
npm view @stickyqr/analytics@1.0.0
```

### Unpublish (Use Carefully!)

```bash
# Unpublish specific version (only within 72 hours)
npm unpublish @stickyqr/analytics@1.0.0

# Deprecate instead (preferred)
npm deprecate @stickyqr/analytics@1.0.0 "This version has a critical bug, please upgrade to 1.0.1"
```

### Update Package Info

```bash
# Update README on npm (without new version)
npm publish --readme-only
```

## Beta/Alpha Releases

### Publish Pre-release

```bash
# Update version with pre-release tag
npm version 1.1.0-beta.1

# Publish with tag
npm publish --tag beta

# Install with tag
npm install @stickyqr/analytics@beta
```

### Promote to Stable

```bash
# Tag as latest
npm dist-tag add @stickyqr/analytics@1.1.0 latest
```

## Package Access Control

### Team Management

```bash
# Add user to team
npm team add stickyqr:developers username

# Remove user
npm team rm stickyqr:developers username

# List team members
npm team ls stickyqr:developers
```

### Package Access

```bash
# Grant access to user
npm owner add username @stickyqr/analytics

# Remove access
npm owner rm username @stickyqr/analytics

# List owners
npm owner ls @stickyqr/analytics
```

## Monitoring

### Package Stats

- NPM downloads: https://www.npmjs.com/package/@stickyqr/analytics
- NPM trends: https://npmtrends.com/@stickyqr/analytics
- Bundlephobia: https://bundlephobia.com/package/@stickyqr/analytics

### Security

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Force fix (may cause breaking changes)
npm audit fix --force
```

## Troubleshooting

### Permission Denied

```bash
# Re-login to npm
npm logout
npm login

# Verify permissions
npm owner ls @stickyqr/analytics
```

### Build Fails

```bash
# Clean and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Publish Fails

```bash
# Check if version already exists
npm view @stickyqr/analytics versions

# Update version
npm version patch

# Try again
npm publish
```

## Best Practices

1. **Always test before publishing**
   ```bash
   npm test && npm run build
   ```

2. **Use semantic versioning correctly**
   - Patch: Bug fixes only
   - Minor: New features, backward compatible
   - Major: Breaking changes

3. **Update CHANGELOG.md**
   - Document all changes
   - Follow Keep a Changelog format

4. **Tag releases in git**
   ```bash
   git tag v1.0.0
   git push --tags
   ```

5. **Create GitHub releases**
   - Include release notes
   - Link to CHANGELOG
   - Mention breaking changes

6. **Deprecate, don't unpublish**
   ```bash
   npm deprecate @stickyqr/analytics@1.0.0 "Upgrade to 1.0.1"
   ```

7. **Test in multiple environments**
   - Web (Chrome, Safari, Firefox)
   - React Native (iOS, Android)
   - Node.js (different versions)

8. **Monitor package health**
   - Check download stats
   - Review security advisories
   - Update dependencies regularly

## Support

For publishing issues:
- NPM Support: https://www.npmjs.com/support
- GitHub Issues: https://github.com/stickyqr/analytics/issues
- Email: support@stickyqr.com

## Links

- NPM Package: https://www.npmjs.com/package/@stickyqr/analytics
- GitHub Repo: https://github.com/stickyqr/analytics
- Documentation: https://github.com/stickyqr/analytics#readme
- Changelog: https://github.com/stickyqr/analytics/blob/main/CHANGELOG.md
