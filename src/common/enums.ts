export enum CheckFrequency {
  OnLoad = 'On Load',
  Daily = 'Daily',
}

export enum UpgradeChannel {
  Latest = 'Latest',
  Next = 'Next',
}

export enum PackagesToCheck {
  cli = '@angular/cli',
  core = '@angular/core',
}

export enum UpdateCommands {
  npmInstall = 'npm install',
  ngUpdate = 'ng update',
  ngCoreCliUpdate = 'ng update @angular/core @angular/cli',
  ngAllCmd = 'ng update --all',
}

export enum UpdateArgs {
  next = '--next',
  force = '--force',
}

export enum Icon {
  none,
  checklist = 'checklist',
  clipboard = 'clipboard',
  continue = 'continue',
  debug = 'debug',
  flask = 'flask',
  glasses = 'glasses',
  evergreen = 'ng-evergreen-logo-mono',
  refresh = 'refresh',
  script = 'script',
  settingsPlus = 'settings-plus',
  settings = 'settings',
  tools = 'tools',
  web = 'web',
}

export enum EvergreenCommand {
  startEvergreen = 'ng-evergreen.startAngularEvergreen',
  stopEvergreen = 'ng-evergreen.stopAngularEvergreen',
  checkForUpdates = 'ng-evergreen.checkForUpdates',
  checkForUpdatesTree = 'ng-evergreen.checkForUpdatesTree',
  navToUpdateIo = 'ng-evergreen.navigateToUpdateIo',
  navToBlogIo = 'ng-evergreen.navigateToBlogIo',
  updateNg = 'ng-evergreen.updateAngular',
  updateNgAll = 'ng-evergreen.updateAll',
  updateNgAllForce = 'ng-evergreen.updateAllForce',
  updateNgNext = 'ng-evergreen.updateAngularNext',
  updateNgNextAll = 'ng-evergreen.updateAllNext',
  updateNgNextAllForce = 'ng-evergreen.updateAllNextForce',
  viewUpdates = 'ng-evergreen.viewAvailableUpdates',
  ncu = 'ng-evergreen.checkNpmUpdates',
  ncuUpgrade = 'ng-evergreen.applyNpmUpdates',
  viewUpdatesNext = 'ng-evergreen.viewAvailableUpdatesNext',
  postUpdateCheckup = 'ng-evergreen.runPostUpdateCheckup',
  configNgVsCode = 'ng-evergreen.configureAngularVsCode',
  requestConsulting = 'ng-evergreen.navigateToConsultingForm',
  reportIssue = 'ng-evergreen.navigateToIssues',
}
