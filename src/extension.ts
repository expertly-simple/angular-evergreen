import * as vscode from 'vscode'

import { ANG_CLI, ANG_CORE, checkForUpdate, IVersionStatus } from './file/package-manager'
import {
  CHECK_FREQUENCY_KEY,
  getCheckFrequency,
  getCheckFrequencyMilliseconds,
} from './common/check-frequency.helpers'

import { CheckFrequency, UpgradeVersion } from './common/enums'
import { isGitClean } from './file/git-manager'
import { ngUpdate, UpdateArgs } from './file/angular-update'
import { upgradeVersionExists, getUpgradeVersion } from './common/upgrade-version.helpers'

export function activate(context: vscode.ExtensionContext) {
  console.log('Angular Evergreen is now active!')

  context.subscriptions.push(
    vscode.commands.registerCommand('ng-evergreen.angularEvergreen', runEvergreen),
    vscode.commands.registerCommand('ng-evergreen.stopAngularEvergreen', stopEvergreen),
    vscode.commands.registerCommand('ng-evergreen.checkForUpdates', checkAngularVersions)
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
    await checkAngularVersions(true)
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
          await checkAngularVersions()
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

async function checkAngularVersions(quiet = false) {
  let cliOutdated = await checkForUpdate(ANG_CLI)
  let coreOutdated = await checkForUpdate(ANG_CORE)

  if (cliOutdated.needsUpdate || coreOutdated.needsUpdate) {
    // this is an issue because this only checks for stored value.
    // when the cli or core is out dated the modal should show.
    // this would be check for updates not automatic update.
    //if (!upgradeVersionExists()) {
    showUpdateModal(coreOutdated)
    //}
  } else {
    if (!quiet) {
      vscode.window.showInformationMessage('Project is already evergreen 🌲 Good job!')
    }
  }
}

async function doAngularUpdate() {
  let gitClean = await isGitClean()
  if (gitClean) {
    let message = 'Update completed! Project is evergreen 🌲'
    const status = await ngUpdate()
    // const terminal = vscode.window.createTerminal(`Angular Evergreen 🌲`)
    // terminal.show()
    // terminal.sendText('npm install')
    // terminal.sendText('npx ng update @angular/cli')
    // terminal.sendText('npx ng update @angular/core')
    // terminal.sendText('npx ng update --all')

    if (!status) {
      message = "Hmm.. that didn't work. Try executing ng update --all --force"
    }
    vscode.window.showInformationMessage(message)
  } else {
    vscode.window.showErrorMessage(
      "Can't update: You should ensure git branch is clean & up-to-date"
    )
  }
}

function showUpdateModal(coreOutdated: IVersionStatus) {
  vscode.window
    .showInformationMessage(
      `Your current version of Angular (${
        coreOutdated.currentVersion
      }) is outdated.\r\n\r\nLatest version: ${
        coreOutdated.newVersion
      }\r\nNext Version: ${
        coreOutdated.nextVersion
      }\r\n\r\nWhich version would you like to update to (this setting can be changed in settings.json)?`,
      { modal: true },
      'LATEST (stable)',
      'NEXT (risky)'
    )
    .then(async value => {
      if (!value || value === '') {
        return
      } else {
        await ngUpdate(value.includes('NEXT') ? [UpdateArgs.next] : [])
      }
    })
}

export function deactivate() {
  console.log('Angular Evergreen is deactive.')
  stopEvergreen()
}
