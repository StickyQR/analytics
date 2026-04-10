# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2026-04-10

### Added
- Added a persistent `deviceId` field to all SDK-generated events and to `analytics.user()`.
- Added `deviceIdKey` to `AnalyticsConfig` for customizing persisted storage keys.
- Added React Native guidance for `react-native-get-random-values` when `crypto.getRandomValues()` is unavailable.

### Changed
- Switched SDK-generated IDs from UUIDv4 to UUIDv7 via the public `uuid()` helper.
- Updated runtime library context version to `1.2.0`.
- Updated README, quick start, React Native setup, deployment, examples, and publishing docs for `deviceId`, UUIDv7, and the `1.2.0` release.

### Notes
- `analytics.reset()` still clears `userId` and traits, but now preserves the persisted `deviceId`.
- `anonymousId` remains overrideable per event; `deviceId` does not.
