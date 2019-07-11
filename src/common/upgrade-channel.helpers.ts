import * as vscode from 'vscode'

import { UpgradeChannel } from './enums'

export const UPGRADE_CHANNEL_KEY = 'ng-evergreen.upgradeChannel'

export function getUpgradeChannel(): string | undefined {
  return vscode.workspace.getConfiguration().get(UPGRADE_CHANNEL_KEY)
}

export function upgradeChannelExists(): boolean {
  const upgradeChannel = getUpgradeChannel()
  return !!upgradeChannel && upgradeChannel !== ''
}

export function storeUpgradeChannel(next: boolean): void {
  const upgradeChannel = next ? UpgradeChannel.Next : UpgradeChannel.Latest
  vscode.workspace.getConfiguration().update(UPGRADE_CHANNEL_KEY, upgradeChannel)
}
