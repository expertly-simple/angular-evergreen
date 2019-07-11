import * as vscode from 'vscode'

import { ANG_CLI, ANG_CORE, checkForUpdate } from '../file/package-manager'

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
