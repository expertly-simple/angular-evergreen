import * as vscode from 'vscode'

import { ANG_CLI, ANG_CORE, checkForUpdate } from './file/package-manager'
import {
  CHECK_FREQUENCY_KEY,
  getCheckFrequency,
  getCheckFrequencyMilliseconds,
} from './common/check-frequency.helpers'
import { CheckFrequency, UpgradeVersion } from './common/enums'
import { getUpgradeVersion, upgradeVersionExists } from './common/upgrade-version.helpers'

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
          await checkForUpdates()
          startJob()
        } else {
          return
        }
      })
  } else {
    startJob()
  }
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
      // set user's update frequency preference in settings.json
      await vscode.workspace
        .getConfiguration()
        .update(CHECK_FREQUENCY_KEY, checkFrequencyValue)
    })
}

async function checkForUpdates(quiet = false) {
  let cliOutdated = await checkForUpdate(ANG_CLI)
  let coreOutdated = await checkForUpdate(ANG_CORE)

  if (cliOutdated.needsUpdate || coreOutdated.needsUpdate) {
    if (!upgradeVersionExists()) {
      const versionOutdatedMsg = `
      Your current version of Angular(${coreOutdated.currentVersion}) is outdated.\r\n\r\n
      Latest version: ${coreOutdated.newVersion}\r\n
      Next Version: ${coreOutdated.nextVersion}\r\n\r\n
      Which version would you like to update to (this setting can be changed in settings.json)?`

      vscode.window
        .showInformationMessage(
          versionOutdatedMsg,
          { modal: true },
          'LATEST (stable)',
          'NEXT (risky)'
        )
        .then(async value => {
          if (!value || value === '') {
            return
          } else {
            const shouldUpdateToNext = value.includes('NEXT')
            await doAngularUpdate(shouldUpdateToNext)
          }
        })
    } else {
      const shouldUpdateToNext = getUpgradeVersion() === UpgradeVersion.Next
      await doAngularUpdate(shouldUpdateToNext)
    }
  } else {
    if (!quiet) {
      vscode.window.showInformationMessage('Project is already evergreen 🌲 Good job!')
    }
  }
}

async function doAngularUpdate(shouldUpdateToNext: boolean = false): Promise<void> {
  let gitClean = await isGitClean()
  if (gitClean) {
    const status = await runNgUpdate(shouldUpdateToNext)
    const message = status
      ? 'Update completed! Project is Evergreen 🌲'
      : 'Hmm... That didn\'t work. Try executing "ng update --all --force"'
    vscode.window.showInformationMessage(message)
  } else {
    vscode.window.showErrorMessage(
      "Can't update. Ensure git branch is clean & up-to-date"
    )
  }
}

export function deactivate() {
  console.log('Angular Evergreen is deactive.')
  stopEvergreen()
}
