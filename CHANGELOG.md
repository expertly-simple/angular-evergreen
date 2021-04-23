# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [2.1.1](https://github.com/expertly-simple/angular-evergreen/compare/v2.0.2...v2.1.1) (2021-04-23)

### Features

- remove commands with the deprecated `--all` option
- add new **List Packages to Update** command to list all Angular packages that need to be updated

### 2.0.1 (2021-03-17)

### Security Updates

- Applied security patches to dependencies

## 2.0.0 (2021-03-17)

### ⚠ BREAKING CHANGES

- invoke `ng update` in angular.json context menu

### Features

- invoke `ng update` in angular.json context menu ([df877b5](https://github.com/expertly-simple/angular-evergreen/commit/df877b54bfd38bd0a1d0d22dd3c57836d2ad1fb7)), closes [#96](https://github.com/expertly-simple/angular-evergreen/issues/96)

## 1.0.0

- Improved UX to make it clear user is about to run a command
- Improved icon contrast
- Added npm check updates command
- Check if git status clean before running certain quick commands

## 0.9.0

- Re-organized UI
- Added more convenience commands
- Implemented ability to view available packages
- Fixed bug where terminal would always open on launch

## 0.8.0

- Improved update check speed
- Implemented sidebar UI
- Removed check frequency to always check on load
- Improved stability

## 0.7.0

- Select upgrade channel `Latest` or `Next`
- Ability to skip a release and be notified on the next release
- More reliable upgrade check algorithm
- More reliable upgrade algoritm with git commits, removing uncommited files and more informative force guidance to restore TypeScript state
- Fixed runtime bug on Windows 10

## 0.6.0

- Check frequency setting to remember your preffered update check frequency
- No longer nags at every launch
- Help run `--force` when update fails

### 0.5.2

- Initial beta release with git clean check, scheduled and manually triggered basic ng update capability.
