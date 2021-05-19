# ![](ng-evergreen-logo-32.png) Angular Evergreen [![CircleCI](https://circleci.com/gh/expertly-simple/angular-evergreen.png)](https://circleci.com/gh/expertly-simple/angular-evergreen/tree/master)

Keep your project's version of Angular and related packages evergreen, keep your settings in sync, and upgrade your Angular CLI projects with ease.

![](ng-evergreen-1.gif)

## Features

Angular Evergreen makes it easier to configure, update, and test your Angular CLI projects.

- Configure your Angular project for VS Code settings

  - Run `Configure VS Code for Angular` and keep your config in sync across projects

    [`mrm-task-angular-vscode`](https://www.npmjs.com/package/mrm-task-angular-vscode) Configures:

    - common Npm packages: [cross-conf-env](https://www.npmjs.com/package/cross-conf-env), [npm-run-all](npm-run-all), [dev-norms](https://www.npmjs.com/package/dev-norms), [rimraf](https://www.npmjs.com/package/rimraf)
    - Npm scripts for styling, and linting
    - ImportSort
    - TsLint
    - Prettier
    - JsBeautify
    - Jasmine and nyc
    - Example.env
    - PR template
    - Angular libraries: [angular-unit-test-helper](https://www.npmjs.com/package/angular-unit-test-helper)
    - VsCode extensions, settings, and launch for debugging

- Keep Angular Evergreen

  - See the `latest` and `next` versions of Angular in your IDE

  ![](ng-evergreen-versions.png)

  - Right click directly in your `angular.json` file to see which packages need to be updated

- Run Post-Update Checkup
  - With one-click, run your unit tests, and build your Angular project in `prod` mode to ensure that your update went smoothly

## Upcoming Features

- Support for multi-root projects and non-standard folder structures

## Contributing

Contributions, issues and feature requests are welcome!
Feel free to check our [contribution guide](https://github.com/expertly-simple/angular-evergreen/blob/contribution-guide/CONTRIBUTING.md).

## Requirements

Projects setup with `@angular/cli` package.

## Extension Settings

```
{
  "ng-evergreen.upgradeChannel": "Latest" | "Next"
}
```

## Contributors

- [@duluca](http://github.com/duluca)
- [@bampakoa](https://github.com/bampakoa)
- [@kentonbmax](http://github.com/kentonbmax)
- [@brendoncaulkins](http://github.com/brendoncaulkins)
- [@alexhoffman617](http://github.com/alexhoffman617)
- [@bjsawyer](https://github.com/bjsawyer)

## Attributions

See the file named THIRDPARTY for attributions.
