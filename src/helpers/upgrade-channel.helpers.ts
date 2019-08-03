import * as vscode from 'vscode'
import { UpgradeChannel } from '../common/enums'
import { Util } from '../common/util'

export const UPGRADE_CHANNEL_KEY = 'ng-evergreen.upgradeChannel'

export function getUpgradeChannel(): UpgradeChannel {
  let upgradeChannel = UpgradeChannel.Latest
  const upgradeChannelSetting = getUpgradeChannelSetting()
  if (
    typeof upgradeChannelSetting === 'string' &&
    upgradeChannelSetting.toLowerCase().includes('next')
  ) {
    upgradeChannel = UpgradeChannel.Next
  }
  return upgradeChannel
}

function getUpgradeChannelSetting() {
  return vscode.workspace.getConfiguration().get(UPGRADE_CHANNEL_KEY)
}

export function upgradeChannelExists(): boolean {
  const upgradeChannelSetting = getUpgradeChannelSetting()
  let knownSettingFound = false

  if (
    typeof upgradeChannelSetting === 'string' &&
    UpgradeChannel[toTitleCase(upgradeChannelSetting) as any]
  ) {
    knownSettingFound = true
  }

  return knownSettingFound
}

function toTitleCase(s: string): string {
  let sArray = s.toLowerCase().split(' ')
  for (let i = 0; i < sArray.length; i++) {
    sArray[i] = sArray[i].charAt(0).toUpperCase() + sArray[i].slice(1)
  }
  return sArray.join(' ')
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

  if (!!upgradeChannelVal && !Util.userCancelled(upgradeChannelVal)) {
    const shouldUpdateToNext = upgradeChannelVal.includes('Next')
    storeUpgradeChannel(shouldUpdateToNext)
  }

  return upgradeChannelVal
}
