# Change Log

All notable changes to the "ng-evergreen" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

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