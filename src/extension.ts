import * as vscode from 'vscode'

import { ANG_CLI, ANG_CORE, checkForUpdate } from './file/package-manager'
import {
  CHECK_FREQUENCY_KEY,
  getCheckFrequency,
  getCheckFrequencyMilliseconds,
} from './common/check-frequency.helpers'

import { CheckFrequency } from './common/enums'
import { isGitClean } from './file/git-manager'
import { ngUpdate } from './file/angular-update'

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
    vscode.window
      .showInformationMessage(
        `Your version of Angular is outdated.\r\nCurrent version: ${
          coreOutdated.currentVersion
        }\r\nLatest version: ${coreOutdated.newVersion}\r\nNext Version: ${
          coreOutdated.nextVersion
        }`,
        { modal: true },
        'Update to Latest',
        'Update to vNext(risky)'
      )
      .then(async value => {
        if (!value) {
          return
        }
        if (value && !value.includes('Update')) {
          return
        } else {
          await ngUpdate(value.includes('vNext'))
        }
      })
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
      "Can't update: Ensure git branch is clean & up-to-date"
    )
  }
}

export function deactivate() {
  console.log('Angular Evergreen is deactive.')
  stopEvergreen()
}
