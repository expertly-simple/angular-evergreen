import * as vscode from 'vscode'

import { PackageManager, IVersionStatus } from '../file/package-manager'
import { UpgradeChannel, UpdateCommands } from '../common/enums'
import { getUpgradeChannel } from './upgrade-channel.helpers'

export const VERSION_TO_SKIP_KEY = 'ng-evergreen.versionToSkip'

export class VersionSkipper {
  readonly _packageManager: PackageManager
  constructor(packageManager: PackageManager) {
    this._packageManager = packageManager
  }

  getVersionToSkip(): string | undefined {
    return vscode.workspace.getConfiguration().get(VERSION_TO_SKIP_KEY)
  }

  versionToSkipExists(): boolean {
    const upgradeVersion = this.getVersionToSkip()
    return !!upgradeVersion && upgradeVersion !== ''
  }

  storeVersionToSkip(versionToSkip: string): void {
    vscode.workspace.getConfiguration().update(VERSION_TO_SKIP_KEY, versionToSkip)
  }

  clearVersionToSkip(): void {
    vscode.workspace.getConfiguration().update(VERSION_TO_SKIP_KEY, undefined)
  }

  async shouldUpgradeToNewVersion(): Promise<boolean> {
    const upgradeChannel = getUpgradeChannel()
    const versionToSkip = this.getVersionToSkip()
    const ngCoreVersion = await this._packageManager.checkForUpdate(
      UpdateCommands.ngCoreCmd,
      upgradeChannel
    )
    const ngCliVersion = await this._packageManager.checkForUpdate(
      UpdateCommands.ngAllCmd,
      upgradeChannel
    )

    let shouldUpgrade: boolean
    if (upgradeChannel === UpgradeChannel.Next) {
      shouldUpgrade =
        ngCoreVersion.nextVersion !== versionToSkip ||
        ngCliVersion.nextVersion !== versionToSkip
    } else {
      shouldUpgrade =
        ngCoreVersion.latestVersion !== versionToSkip ||
        ngCliVersion.latestVersion !== versionToSkip
    }

    return new Promise(() => shouldUpgrade)
  }

  async getVersionToSkipPreference(): Promise<string | undefined> {
    const upgradeChannel = getUpgradeChannel()
    // we sure do call the next two lines a lot seems like a problem.
    const ngCoreVersion = await this._packageManager.checkForUpdate(
      UpdateCommands.ngCoreCmd,
      upgradeChannel
    )
    const ngCliVersion = await this._packageManager.checkForUpdate(
      UpdateCommands.ngAllCmd,
      upgradeChannel
    )
    const shouldUpdateToNext = upgradeChannel === UpgradeChannel.Next

    const channelText = shouldUpdateToNext ? '"next"' : '"latest"'
    const newCoreVersion = getNewVersionFromStatus(shouldUpdateToNext, coreOutdated)
    const newCliVersion = getNewVersionFromStatus(shouldUpdateToNext, cliOutdated)

    let versionToSkipVal = await showUpdateModal(
      channelText,
      coreOutdated,
      newCoreVersion,
      cliOutdated,
      newCliVersion
    )

    if (versionToSkipVal && versionToSkipVal.includes('Remind Me')) {
      this.storeVersionToSkip(
        shouldUpdateToNext ? coreOutdated.nextVersion : coreOutdated.latestVersion
      )
      versionToSkipVal = ''
    }

    return versionToSkipVal
  }

  getNewVersionFromStatus(shouldUpdateToNext: boolean, versionStatus: IVersionStatus) {
    return shouldUpdateToNext ? versionStatus.nextVersion : versionStatus.latestVersion
  }

  async showUpdateModal(
    channelText: string,
    coreOutdated: IVersionStatus,
    newCoreVersion: string,
    cliOutdated: IVersionStatus,
    newCliVersion: string
  ) {
    const versionOutdatedMsg = `New update available! One or more of your Angular packages are behind the most recent ${channelText} release. Would you like to update?
      \r\nAngular Core: ${
        coreOutdated.currentVersion
      } -> ${newCoreVersion}\r\nAngular CLI: ${
      cliOutdated.currentVersion
    } -> ${newCliVersion}`

    return await vscode.window.showInformationMessage(
      versionOutdatedMsg,
      { modal: true },
      'Update Now',
      'Remind Me Next Release'
    )
  }

  skipVersionCheck(
    upgradeChannel: UpgradeChannel,
    versionToSkip: string | undefined,
    coreOutdated: IVersionStatus,
    cliOutdated: IVersionStatus
  ): boolean {
    switch (upgradeChannel) {
      case UpgradeChannel.Next:
        return versionToSkip === coreOutdated.nextVersion &&
          versionToSkip === cliOutdated.nextVersion
          ? true
          : false
      case UpgradeChannel.Latest:
        return versionToSkip === coreOutdated.latestVersion &&
          versionToSkip === cliOutdated.latestVersion
          ? true
          : false
    }
  }
}
