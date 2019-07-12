import * as vscode from 'vscode'

import { ANG_CLI, ANG_CORE, IVersionStatus, checkForUpdate } from './file/package-manager'

import {
  CHECK_FREQUENCY_KEY,
  checkFrequencyExists,
  getCheckFrequencyMilliseconds,
} from './common/check-frequency.helpers'
import { CheckFrequency, UpgradeChannel } from './common/enums'
import {
  clearVersionToSkip,
  getVersionToSkip,
  storeVersionToSkip,
  versionToSkipExists,
} from './common/version-to-skip.helpers'
import {
  getUpgradeChannel,
  storeUpgradeChannel,
  upgradeChannelExists,
} from './common/upgrade-channel.helpers'

import { isGitClean } from './file/git-manager'
import { runNgUpdate } from './file/angular-update'

export function activate(context: vscode.ExtensionContext) {
  console.log('Angular Evergreen is now active!')

  context.subscriptions.push(
    vscode.commands.registerCommand('ng-evergreen.startAngularEvergreen', startEvergreen),
    vscode.commands.registerCommand('ng-evergreen.stopAngularEvergreen', stopEvergreen),
    vscode.commands.registerCommand('ng-evergreen.checkForUpdates', checkForUpdates)
  )

  vscode.commands.executeCommand('ng-evergreen.startAngularEvergreen')
}

let job: NodeJS.Timeout | null = null

async function startEvergreen(): Promise<void> {
  // if existing job is running, cancel it
  if (job) {
    clearInterval(job)
  }

  if (await shouldRunEvergreen()) {
    // run Evergreen initially before job begins
    await runEvergreen()

    // start new job
    const milliseconds = getCheckFrequencyMilliseconds()
    job = setInterval(async () => {
      await runEvergreen()
    }, milliseconds)
  }
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

  if (!versionToSkipExists()) {
    const versionToSkipInput = await getVersionToSkipPreference()
    if (userCancelled(versionToSkipInput)) {
      return
    }
  }

  await checkForUpdates()
}

function userCancelled(userInput: string | undefined) {
  return !userInput || userInput === ''
}

async function shouldRunEvergreen(): Promise<boolean> {
  const runEvergreenVal = await vscode.window.showInformationMessage(
    'Keep Angular evergreen?',
    {},
    'Check for updates periodically',
    'Cancel'
  )

  return !!runEvergreenVal && runEvergreenVal !== '' && runEvergreenVal !== 'Cancel'
}

async function getCheckFrequencyPreference(): Promise<string | undefined> {
  const checkFrequencyVal = await vscode.window.showInformationMessage(
    'How often would you like to check for updates (this can be changed in settings.json)?',
    {},
    CheckFrequency.EveryMinute,
    CheckFrequency.Hourly,
    CheckFrequency.Daily,
    CheckFrequency.Weekly,
    CheckFrequency.BiWeekly
  )

  if (checkFrequencyVal && checkFrequencyVal !== '') {
    await vscode.workspace
      .getConfiguration()
      .update(CHECK_FREQUENCY_KEY, checkFrequencyVal)
  }

  return checkFrequencyVal
}

async function getUpgradeChannelPreference(): Promise<string | undefined> {
  const message = `Going forward, would you like to check for Latest releases (stable) or Next releases (risky)? This can be changed in the future in settings.json.`
  const upgradeChannelVal = await vscode.window.showInformationMessage(
    message,
    {},
    'Latest',
    'Next'
  )

  if (upgradeChannelVal && upgradeChannelVal !== '') {
    const shouldUpdateToNext = upgradeChannelVal.includes('Next')
    storeUpgradeChannel(shouldUpdateToNext)
  }

  return upgradeChannelVal
}

async function getVersionToSkipPreference(): Promise<string | undefined> {
  const cliOutdated = await checkForUpdate(ANG_CLI)
  const coreOutdated = await checkForUpdate(ANG_CORE)
  const shouldUpdateToNext = getUpgradeChannel() === UpgradeChannel.Next

  const channelText = shouldUpdateToNext ? '"next"' : '"stable"'
  const newCoreVersion = shouldUpdateToNext
    ? coreOutdated.nextVersion
    : coreOutdated.latestVersion
  const newCliVersion = shouldUpdateToNext
    ? cliOutdated.nextVersion
    : cliOutdated.latestVersion
  const versionOutdatedMsg = `New update available! One or more of your Angular packages are behind the most recent ${channelText} release.
      \r\nAngular Core: ${coreOutdated.currentVersion} -> ${newCoreVersion}
      \r\nAngular CLI: ${cliOutdated.currentVersion} -> ${newCliVersion}
      \r\nWould you like to update?`

  let versionToSkipVal = await vscode.window.showInformationMessage(
    versionOutdatedMsg,
    { modal: true },
    'Update now',
    'Remind me next release'
  )

  if (versionToSkipVal && versionToSkipVal.includes('Remind me')) {
    storeVersionToSkip(
      shouldUpdateToNext ? coreOutdated.nextVersion : coreOutdated.latestVersion
    )
    versionToSkipVal = ''
  }

  return versionToSkipVal
}

async function checkForUpdates(quiet = false): Promise<void> {
  const cliOutdated = await checkForUpdate(ANG_CLI)
  const coreOutdated = await checkForUpdate(ANG_CORE)

  if (cliOutdated.needsUpdate || coreOutdated.needsUpdate) {
    const shouldUpdateToNext = getUpgradeChannel() === UpgradeChannel.Next
    await doAngularUpdate(shouldUpdateToNext)
  } else {
    if (!quiet) {
      vscode.window.showInformationMessage('Project is already Evergreen. 🌲 Good job!')
    }
  }
}

async function doAngularUpdate(shouldUpdateToNext: boolean = false): Promise<void> {
  const cliOutdated = await checkForUpdate(ANG_CLI)
  const coreOutdated = await checkForUpdate(ANG_CORE)
  const versionToSkip = getVersionToSkip()

  const shouldSkipVersion = skipVersionCheck(
    shouldUpdateToNext,
    versionToSkip,
    coreOutdated,
    cliOutdated
  )

  if (!shouldSkipVersion) {
    await update(shouldUpdateToNext)
    return
  }
}

function skipVersionCheck(
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

async function update(shouldUpdateToNext: boolean): Promise<void> {
  const gitClean = await isGitClean()

  if (gitClean) {
    const status = await runNgUpdate(shouldUpdateToNext)
    let message = ''
    if (status) {
      message = 'Update completed! Project is Evergreen 🌲'
      clearVersionToSkip()
    } else {
      message = 'Hmm... That didn\'t work. Try executing "ng update --all --force"'
    }
    vscode.window.showInformationMessage(message)
  } else {
    vscode.window.showErrorMessage(
      "Can't update. Ensure git branch is clean & up-to-date"
    )
    .then(async value => {
      if (!value || value === '') {
        return
      } else {
        const isNext = value.includes('NEXT')
        if (!upgradeVersionExists()) {
          storeUpgradeVersion(isNext)
        }
        await tryAngularUpdate(isNext ? [UpdateArgs.next] : [])
      }
    })
}
