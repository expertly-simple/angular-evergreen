import { read } from 'fs'

import * as vscode from 'vscode'

import { PackagesToCheck, UpdateCommands, UpgradeChannel } from '../common/enums'
import { WorkspaceManager } from '../common/workspace-manager'
import { IVersionStatus, PackageManager } from '../updaters/package-manager'
import { getUpgradeChannel } from './upgrade-channel.helpers'

export class VersionSkipper {
  readonly _packageManager: PackageManager
  readonly _workspaceManager: WorkspaceManager

  constructor(packageManager: PackageManager, workspaceManager: WorkspaceManager) {
    this._packageManager = packageManager
    this._workspaceManager = workspaceManager
  }

  versionToSkipExists(): boolean {
    const upgradeVersion = this._workspaceManager.getVersionToSkip()
    return !!upgradeVersion && upgradeVersion !== ''
  }

  async shouldUpgradeToNewVersion(): Promise<boolean> {
    const upgradeChannel = getUpgradeChannel()
    const versionToSkip = this._workspaceManager.getVersionToSkip()
    const ngCoreVersion = await this._packageManager.checkForUpdate(
      PackagesToCheck.core,
      upgradeChannel
    )
    const ngCliVersion = await this._packageManager.checkForUpdate(
      PackagesToCheck.cli,
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
    const cliOutdated = await this._packageManager.checkForUpdate(
      PackagesToCheck.core,
      upgradeChannel
    )
    const coreOutdated = await this._packageManager.checkForUpdate(
      PackagesToCheck.cli,
      upgradeChannel
    )
    // we sure do call the next two lines a lot seems like a problem.
    const ngCoreVersion = await this._packageManager.checkForUpdate(
      PackagesToCheck.core,
      upgradeChannel
    )
    const ngCliVersion = await this._packageManager.checkForUpdate(
      PackagesToCheck.cli,
      upgradeChannel
    )
    const shouldUpdateToNext = upgradeChannel === UpgradeChannel.Next

    const channelText = shouldUpdateToNext ? '"next"' : '"latest"'
    const newCoreVersion = this.getNewVersionFromStatus(shouldUpdateToNext, coreOutdated)
    const newCliVersion = this.getNewVersionFromStatus(shouldUpdateToNext, cliOutdated)

    let versionToSkipVal = await this.showUpdateModal(
      channelText,
      coreOutdated,
      newCoreVersion,
      cliOutdated,
      newCliVersion
    )

    if (versionToSkipVal && versionToSkipVal.includes('Remind Me')) {
      this._workspaceManager.storeVersionToSkip(
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
      \r\nAngular Core: ${coreOutdated.currentVersion} -> ${newCoreVersion}\r\nAngular CLI: ${cliOutdated.currentVersion} -> ${newCliVersion}`

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
