import * as vscode from 'vscode'

import { UpgradeVersion } from './enums'

export const UPGRADE_VERSION_KEY = 'ng-evergreen.upgradeVersion'

export function getUpgradeVersion(): string | undefined {
  return vscode.workspace.getConfiguration().get(UPGRADE_VERSION_KEY)
}

export function upgradeVersionExists(): boolean {
  const upgradeVersion = getUpgradeVersion()
  return !!upgradeVersion && upgradeVersion !== ''
}

export function storeUpgradeVersion(next: boolean): void {
  const upgradeVersion = next ? UpgradeVersion.Next : UpgradeVersion.Latest
  vscode.workspace.getConfiguration().update(UPGRADE_VERSION_KEY, upgradeVersion)
}
