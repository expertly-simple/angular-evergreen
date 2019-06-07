import * as vscode from 'vscode'

import { ANG_CLI, ANG_CORE, checkForUpdate } from './file/package-manager'

import { CronJob } from 'cron'
import { isGitClean } from './file/git-manager'
import { ngUpdate } from './file/angular-update'

export function activate(context: vscode.ExtensionContext) {
  console.log('Angular Evergreen is now active!')

  context.subscriptions.push(
    vscode.commands.registerCommand('ng-evergreen.angularEvergreen', runEvergreen),
    vscode.commands.registerCommand('ng-evergreen.stopAngularEvergreen', stopEvergreen),
    vscode.commands.registerCommand('ng-evergreen.checkForUpdates', checkAngularVersions)
  )
}

const twentyFourHourSchedule = '0 0 */24 * * *'
const testingInterval = '*/30 * * * * *'

const job = new CronJob(testingInterval, async function() {
  await checkAngularVersions(true)
})

function stopEvergreen() {
  let message = 'No scheduled periodic checks were found. All is good 👍'
  if (job && job.running) {
    job.stop()
    message = 'Cancelled periodic checks 👋'
  }

  vscode.window.showInformationMessage(message)
}

function runEvergreen() {
  vscode.window
    .showInformationMessage(
      'Keep Angular evergreen?',
      {},
      'Check for updates periodically',
      'Cancel'
    )
    .then(async value => {
      if (value === 'Cancel') {
        return
      } else {
        await checkAngularVersions()
        if (job && !job.running) {
          job.start()
        }
      }
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
        }\r\nNew version: ${coreOutdated.newVersion}`,
        { modal: true },
        'Update Angular',
        'Not now'
      )
      .then(async value => {
        if (value !== 'Update Angular') {
          return
        } else {
          await doAngularUpdate()
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
    await ngUpdate()
    // const terminal = vscode.window.createTerminal(`Angular Evergreen 🌲`)
    // terminal.show()
    // terminal.sendText('npm install')
    // terminal.sendText('npx ng update @angular/cli')
    // terminal.sendText('npx ng update @angular/core')
    // terminal.sendText('npx ng update --all')
    vscode.window.showInformationMessage('Update completed! Project is evergreen 🌲')
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
