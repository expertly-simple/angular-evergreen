import * as vscode from 'vscode'

import { ANG_CLI, ANG_CORE, IVersionStatus, checkForUpdate } from './file/package-manager'
import {
  CHECK_FREQUENCY_KEY,
  getCheckFrequency,
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
    vscode.commands.registerCommand('ng-evergreen.angularEvergreen', runEvergreen),
    vscode.commands.registerCommand('ng-evergreen.stopAngularEvergreen', stopEvergreen),
    vscode.commands.registerCommand('ng-evergreen.checkForUpdates', checkForUpdates)
  )

  // run it
  vscode.commands.executeCommand('ng-evergreen.angularEvergreen')
}

let job: NodeJS.Timeout | null = null

function startJob() {
  // if existing job is running, cancel it
  if (job) {
    clearInterval(job)
  }

  // start new job
  const milliseconds = getCheckFrequencyMilliseconds()
  job = setInterval(async () => {
    await checkForUpdates(true)
  }, milliseconds)
}

function stopEvergreen() {
  let message = 'No scheduled periodic checks were found. All is good 👍'
  if (job) {
    clearInterval(job)
    message = 'Cancelled periodic checks 👋'
  }

  vscode.window.showInformationMessage(message)
}

function runEvergreen() {
  const isFirstRun = !getCheckFrequency() || getCheckFrequency() === ''
  if (isFirstRun) {
    vscode.window
      .showInformationMessage(
        'Keep Angular evergreen?',
        {},
        'Check for updates periodically',
        'Cancel'
      )
      .then(async value => {
        if (value !== 'Cancel') {
          await setCheckFrequency()
          await getUpgradeChannelPreference()
          await checkForUpdates()
          startJob()
        } else {
          return
        }
      })
  } else {
    startJob()
  }

  async function setCheckFrequency() {
    await vscode.window
      .showInformationMessage(
        'How often would you like to check for updates (this can be changed in settings.json)?',
        {},
        CheckFrequency.EveryMinute,
        CheckFrequency.Hourly,
        CheckFrequency.Daily,
        CheckFrequency.Weekly,
        CheckFrequency.BiWeekly
      )
      .then(async checkFrequencyValue => {
        await vscode.workspace
          .getConfiguration()
          .update(CHECK_FREQUENCY_KEY, checkFrequencyValue)
      })
  }
}

async function getUpgradeChannelPreference() {
  const message = `Going forward, would you like to check for Latest releases (stable)
       or Next releases (risky)? This can be changed in the future in settings.json.`
  vscode.window
    .showInformationMessage(message, { modal: true }, 'Latest', 'Next')
    .then(async value => {
      if (!value || value === '') {
        return
      } else {
        const shouldUpdateToNext = value.includes('Next')
        storeUpgradeChannel(shouldUpdateToNext)
      }
    })
}

async function checkForUpdates(quiet = false) {
  const cliOutdated = await checkForUpdate(ANG_CLI)
  const coreOutdated = await checkForUpdate(ANG_CORE)

  if (cliOutdated.needsUpdate || coreOutdated.needsUpdate) {
    if (!upgradeChannelExists()) {
      await getUpgradeChannelPreference()
    }
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

  if (versionToSkipExists) {
    const versionToSkip = getVersionToSkip()
    if (
      !shouldSkipVersion(shouldUpdateToNext, versionToSkip, coreOutdated, cliOutdated)
    ) {
      await update()
      return
    }
  } else {
    const channelText = shouldUpdateToNext ? '"next"' : '"stable"'
    const newCoreVersion = shouldUpdateToNext
      ? coreOutdated.nextVersion
      : coreOutdated.latestVersion
    const newCliVersion = shouldUpdateToNext
      ? cliOutdated.nextVersion
      : cliOutdated.latestVersion
    const versionOutdatedMsg = `New update available! One or more of your Angular
     packages are behind the most recent ${channelText} release.
      \r\nAngular Core: ${coreOutdated.currentVersion} -> ${newCoreVersion}
      \r\nAngular CLI: ${cliOutdated.currentVersion} -> ${newCliVersion}
      \r\nWould you like to update?`
    vscode.window
      .showInformationMessage(
        versionOutdatedMsg,
        { modal: true },
        'Update now',
        'Remind me next release'
      )
      .then(async value => {
        if (!value || value === '') {
          return
        } else if (value.includes('Remind me')) {
          storeVersionToSkip(
            shouldUpdateToNext ? coreOutdated.nextVersion : coreOutdated.currentVersion
          )
          return
        } else {
          await update()
          return
        }
      })
  }

  async function update() {
    let gitClean = await isGitClean()
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
    }
  }

  function shouldSkipVersion(
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
}

export function deactivate() {
  console.log('Angular Evergreen is deactive.')
  stopEvergreen()
}
