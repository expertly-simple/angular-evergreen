import * as vscode from 'vscode'

import { IVersionStatus, PackageManager } from '../file/package-manager'
import { PackagesToCheck, UpgradeChannel } from '../common/enums'

import { WorkspaceManager } from '../common/workspace-manager'
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

  async updateNowQuestion(
    coreStatus: IVersionStatus,
    cliStatus: IVersionStatus
  ): Promise<boolean> {
    const upgradeChannel = getUpgradeChannel()
    const shouldUpdateToNext = upgradeChannel === UpgradeChannel.Next

    const channelText = shouldUpdateToNext ? '"next"' : '"latest"'
    const newCoreVersion = this.getNewVersionFromStatus(shouldUpdateToNext, coreStatus)
    const newCliVersion = this.getNewVersionFromStatus(shouldUpdateToNext, cliStatus)

    let versionToSkipVal = await this.showUpdateModal(
      channelText,
      coreStatus,
      newCoreVersion,
      cliStatus,
      newCliVersion
    )

    if (versionToSkipVal && versionToSkipVal.includes('Remind Me')) {
      this._workspaceManager.storeVersionToSkip(
        shouldUpdateToNext ? coreStatus.nextVersion : coreStatus.latestVersion
      )
      return false
    }

    return !!versionToSkipVal
  }

  getNewVersionFromStatus(shouldUpdateToNext: boolean, versionStatus: IVersionStatus) {
    return shouldUpdateToNext ? versionStatus.nextVersion : versionStatus.latestVersion
  }

  showUpdateModal(
    channelText: string,
    coreOutdated: IVersionStatus,
    newCoreVersion: string,
    cliOutdated: IVersionStatus,
    newCliVersion: string
  ): Thenable<string | undefined> {
    let message = `New ${channelText} release available! Update the following packages now?`
    if (coreOutdated.needsUpdate) {
      message += ` @angular/core: ${coreOutdated.currentVersion} -> ${newCoreVersion}`
      message += cliOutdated.needsUpdate ? ', ' : ''
    }
    if (cliOutdated.needsUpdate) {
      message += ` @angular/cli: ${cliOutdated.currentVersion} -> ${newCliVersion}`
    }

    return vscode.window.showInformationMessage(
      message,
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
