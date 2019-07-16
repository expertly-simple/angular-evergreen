import * as vscode from 'vscode'

import {
  ANG_CLI,
  ANG_CORE,
  IVersionStatus,
  checkForUpdate,
} from '../file/package-manager'

import { UpgradeChannel } from './enums'
import { getUpgradeChannel } from './upgrade-channel.helpers'

export const VERSION_TO_SKIP_KEY = 'ng-evergreen.versionToSkip'

export function getVersionToSkip(): string | undefined {
  return vscode.workspace.getConfiguration().get(VERSION_TO_SKIP_KEY)
}

export function versionToSkipExists(): boolean {
  const upgradeVersion = getVersionToSkip()
  return !!upgradeVersion && upgradeVersion !== ''
}

export function storeVersionToSkip(versionToSkip: string): void {
  vscode.workspace.getConfiguration().update(VERSION_TO_SKIP_KEY, versionToSkip)
}

export function clearVersionToSkip(): void {
  vscode.workspace.getConfiguration().update(VERSION_TO_SKIP_KEY, undefined)
}

export async function shouldUpgradeToNewVersion(): Promise<boolean> {
  const upgradeChannel = getUpgradeChannel()
  const versionToSkip = getVersionToSkip()
  const ngCoreVersion = await checkForUpdate(ANG_CORE)
  const ngCliVersion = await checkForUpdate(ANG_CLI)

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

export async function getVersionToSkipPreference(): Promise<string | undefined> {
  const cliOutdated = await checkForUpdate(ANG_CLI)
  const coreOutdated = await checkForUpdate(ANG_CORE)
  const shouldUpdateToNext = getUpgradeChannel() === UpgradeChannel.Next

  const channelText = shouldUpdateToNext ? '"next"' : '"stable"'
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
    storeVersionToSkip(
      shouldUpdateToNext ? coreOutdated.nextVersion : coreOutdated.latestVersion
    )
    versionToSkipVal = ''
  }

  return versionToSkipVal
}

function getNewVersionFromStatus(
  shouldUpdateToNext: boolean,
  versionStatus: IVersionStatus
) {
  return shouldUpdateToNext ? versionStatus.nextVersion : versionStatus.latestVersion
}

async function showUpdateModal(
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

export function skipVersionCheck(
  shouldUpdateToNext: boolean,
  versionToSkip: string | undefined,
  coreOutdated: IVersionStatus,
  cliOutdated: IVersionStatus
): boolean {
  if (shouldUpdateToNext) {
    return versionToSkip === coreOutdated.nextVersion &&
      versionToSkip === cliOutdated.nextVersion
      ? true
      : false
  } else {
    return versionToSkip === coreOutdated.latestVersion &&
      versionToSkip === cliOutdated.latestVersion
      ? true
      : false
  }
}
