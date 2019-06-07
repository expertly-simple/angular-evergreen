# ![](ng-evergreen-logo-32.png) Angular Evergreen [![CircleCI](https://circleci.com/gh/duluca/angular-evergreen.png)](https://circleci.com/gh/duluca/angular-evergreen/tree/master)

Keep your project's version of Angular and related packages evergreen with periodic update checks and upgrade your Angular CLI projects with ease.

![](ng-evergreen-do-update-sm.gif)

## Features

- Launch Angular Evergreen
  - Schedules a `Check for Angular Updates` every 24 hours.
  - Stop command, cancels scheduled checks for updates
- Check for Angular Updates
  - Manually run to see if there are updates
  - Checks to see if git branch is clean
  - Executes `npm install`
  - Runs `ng update --all`

## Upcoming Features

- Subscribe to `stable`, `alpha`, `beta`, `rc` update channels
- Assist users clean git branch before update
- Help run `--force` when update fails
- Fix `typescript` version, after a `--force` install
- Execute `ng build` and `ng test` after upgrade
- Ability to rollback upgrades
- Check for updates to packages not covered by `ng update` i.e. `@angular/flex-layout`
- Allow customizing schedule interval
- Support non-@angular/cli Angular projects

_Have a feature request or submit a PR?_ Submit an issue/PR on GitHub [here](https://github.com/duluca/angular-evergreen/issues).

## Requirements

Projects setup with `@angular/cli` package.

## Extension Settings

_Coming soon_

## Release Notes

### 0.5.2

Initial beta release with git clean check, scheduled and manually triggered basic ng update capability.

## Contributors

- [@duluca](http://github.com/duluca)
- [@kentonbmax](http://github.com/kentonbmax)
- [@brendoncaulkins](http://github.com/brendoncaulkins)
- [@alexhoffman617](http://github.com/alexhoffman617)
