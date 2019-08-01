import * as open from 'open'
import * as vscode from 'vscode'
import { Util } from '../src/common/util'
import { PackageManager } from './file/package-manager'
import { CheckFrequency, UpgradeChannel } from './common/enums'
import {
  checkFrequencyExists,
  getCheckFrequency,
  getCheckFrequencyPreference,
} from './helpers/check-frequency.helpers'
import {
  getUpgradeChannel,
  getUpgradeChannelPreference,
  upgradeChannelExists,
} from './helpers/upgrade-channel.helpers'
import {
  getVersionToSkip,
  getVersionToSkipPreference,
  skipVersionCheck,
  versionToSkipExists,
} from './helpers/version-to-skip.helpers'

import { SideMenuTaskProvider } from './ui/side-menu-task-provider'
import * as open from 'open'
import { AngularUpdate } from './file/angular-update'
import { userCancelled } from './common/common.helpers'

export function activate(context: vscode.ExtensionContext) {
  console.log('Angular Evergreen is now active!')

  context.subscriptions.push(
    vscode.commands.registerCommand('ng-evergreen.startAngularEvergreen', runEvergreen),
    vscode.commands.registerCommand('ng-evergreen.checkForUpdates', checkForUpdates),
    vscode.commands.registerCommand(
      'ng-evergreen.navigateToUpdateIo',
      navigateToUpdateIo
    ),
    vscode.commands.registerCommand('ng-evergreen.navigateToBlogIo', navigateToBlogIo),
    vscode.window.registerTreeDataProvider('evergreen', new SideMenuTaskProvider(context))
  )

  const isFirstRun = !checkFrequencyExists()
  if (isFirstRun) {
    vscode.commands.executeCommand('ng-evergreen.startAngularEvergreen')
  } else if (getCheckFrequency() !== CheckFrequency.OnLoad &&
            ) {
    vscode.commands.executeCommand('ng-evergreen.checkForUpdates')
  }
}

async function runEvergreen(): Promise<void> {
  if ((await shouldRunEvergreen()) === false) {
    return
  }

  if (!checkFrequencyExists()) {
    const checkFrequencyInput = await getCheckFrequencyPreference()
  }

  if (!upgradeChannelExists()) {
    const upgradeChannelInput = await getUpgradeChannelPreference()
  }

  await checkForUpdates()
}

async function shouldRunEvergreen(): Promise<boolean> {
  const runEvergreenVal = await vscode.window.showInformationMessage(
    'Keep Angular evergreen?',
    {},
    'Check for updates periodically',
    'Cancel'
  )
  return !Util.userCancelled(runEvergreenVal)
}

async function checkForUpdates(): Promise<void> {
  const upgradeChannel = getUpgradeChannel()
  const coreOutdated = await checkForUpdate(ANG_CORE, upgradeChannel)
  const cliOutdated = await checkForUpdate(ANG_CLI, upgradeChannel)
  if (cliOutdated.needsUpdate || coreOutdated.needsUpdate) {
    if (!versionToSkipExists()) {
      const shouldUpdate = await getVersionToSkipPreference()
      if (!!shouldUpdate && shouldUpdate.includes('Update Now')) {
        await doAngularUpdate(coreOutdated, cliOutdated, upgradeChannel)
      }
    } else {
      await doAngularUpdate(coreOutdated, cliOutdated, upgradeChannel)
    }
  } else {
    vscode.window.showInformationMessage('Project is already Evergreen. 🌲 Good job!')
  }
}

async function doAngularUpdate(
  coreOutdated: IVersionStatus,
  cliOutdated: IVersionStatus,
  upgradeChannel: UpgradeChannel
): Promise<void> {
  const versionToSkip = getVersionToSkip()
  const shouldSkipVersion = skipVersionCheck(
    upgradeChannel,
    versionToSkip,
    coreOutdated,
    cliOutdated
  )
  if (shouldSkipVersion) {
    vscode.window.showInformationMessage(
      `Skipping update for Angular v${versionToSkip} (${upgradeChannel}).`
    )
  } else {
    await tryAngularUpdate(upgradeChannel)
  }
}

async function navigateToUpdateIo() {
  await open('https://update.angular.io/')
}

async function navigateToBlogIo() {
  await open('https://blog.angular.io/')
}
