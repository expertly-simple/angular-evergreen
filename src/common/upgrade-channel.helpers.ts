import * as vscode from 'vscode'

import { UpgradeChannel } from './enums'
import { userCancelled } from './common.helpers'

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

export async function getUpgradeChannelPreference(): Promise<string | undefined> {
  const message = `Going forward, would you like to check for Latest releases (stable) or Next releases (risky)? This can be changed in the future in settings.json.`
  const upgradeChannelVal = await vscode.window.showInformationMessage(
    message,
    {},
    'Latest',
    'Next',
    'Cancel'
  )

  if (!!upgradeChannelVal && !userCancelled(upgradeChannelVal)) {
    const shouldUpdateToNext = upgradeChannelVal.includes('Next')
    storeUpgradeChannel(shouldUpdateToNext)
  }

  return upgradeChannelVal
}
