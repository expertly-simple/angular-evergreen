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
  ngCoreCliUpdate = 'npx ng update @angular/cli @angular/core',
  ngAllCmd = 'npx ng update --all',
}

export enum UpdateArgs {
  next = '--next',
  force = '--force',
}
