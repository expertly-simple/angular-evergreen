import * as vscode from 'vscode'

import { ANG_CLI, ANG_CORE, IVersionStatus, checkForUpdate } from './file/package-manager'
import { CheckFrequency, UpgradeChannel } from './common/enums'
import {
  checkFrequencyExists,
  getCheckFrequency,
  getCheckFrequencyMilliseconds,
  getCheckFrequencyPreference,
} from './common/check-frequency.helpers'
import {
  getUpgradeChannel,
  getUpgradeChannelPreference,
  upgradeChannelExists,
} from './common/upgrade-channel.helpers'
import {
  getVersionToSkip,
  getVersionToSkipPreference,
  skipVersionCheck,
  versionToSkipExists,
} from './common/version-to-skip.helpers'

import { tryAngularUpdate } from './file/angular-update'
import { userCancelled } from './common/common.helpers'

import { SideMenuTaskProvider } from './common/side-menu-task-provider'
import * as open from 'open'

export function activate(context: vscode.ExtensionContext) {
  console.log('Angular Evergreen is now active!')

  context.subscriptions.push(
    vscode.commands.registerCommand('ng-evergreen.startAngularEvergreen', runEvergreen),
    vscode.commands.registerCommand('ng-evergreen.stopAngularEvergreen', stopEvergreen),
    vscode.commands.registerCommand('ng-evergreen.checkForUpdates', checkForUpdates),
    vscode.commands.registerCommand(
      'ng-evergreen.navigateToUpdateIo',
      navigateToUpdateIo
    ),
    vscode.window.registerTreeDataProvider('evergreen', new SideMenuTaskProvider(context))
  )

  const isFirstRun = !checkFrequencyExists()
  if (isFirstRun) {
    vscode.commands.executeCommand('ng-evergreen.startAngularEvergreen')
  } else if (getCheckFrequency() === CheckFrequency.OnLoad) {
    vscode.commands.executeCommand('ng-evergreen.checkForUpdates')
  } else {
    startJob()
  }
}

let job: NodeJS.Timeout | null = null

async function startJob(): Promise<void> {
  // if existing job is running, cancel it
  if (job) {
    clearInterval(job)
  }

  // start new job
  const milliseconds = getCheckFrequencyMilliseconds()
  job = setInterval(async () => {
    // run every X milliseconds
    vscode.commands.executeCommand('ng-evergreen.checkForUpdates')
  }, milliseconds)
}

function stopEvergreen(): void {
  let message = 'No scheduled periodic checks were found. All is good 👍'
  if (job) {
    clearInterval(job)
    message = 'Cancelled periodic checks 👋'
  }

  vscode.window.showInformationMessage(message)
}

async function runEvergreen(): Promise<void> {
  if ((await shouldRunEvergreen()) === false) {
    return
  }


  if (!checkFrequencyExists()) {
    const checkFrequencyInput = await getCheckFrequencyPreference()
    if (userCancelled(checkFrequencyInput)) {
      return
    }
  }

  if (!upgradeChannelExists()) {
    const upgradeChannelInput = await getUpgradeChannelPreference()
    if (userCancelled(upgradeChannelInput)) {
      return
    }
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
  return !userCancelled(runEvergreenVal)
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
