import * as vscode from 'vscode'

import { ANG_CLI, ANG_CORE, checkForUpdate } from './file/package-manager'
import {
  UPGRADE_VERSION_KEY,
  getUpgradeVersion,
  upgradeVersionExists,
} from './common/upgrade-version.helpers'

import { CronJob } from 'cron'
import { UpgradeVersion } from './common/enums'
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

const twentyFourHourSchedule = '0 0 */24 * * *'
//const testingInterval = '*/30 * * * * *'

const job = new CronJob(twentyFourHourSchedule, async function() {
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
    if (!upgradeVersionExists()) {
      vscode.window
        .showInformationMessage(
          `Your version of Angular is outdated.\r\nCurrent version: ${
            coreOutdated.currentVersion
          }\r\nLatest version: ${coreOutdated.newVersion}\r\nNext Version: ${
            coreOutdated.nextVersion
          }\r\nWhich version would you like to update to
          (this setting can be changed in settings.json)?`,
          { modal: true },
          'LATEST (stable)',
          'NEXT (risky)'
        )
        .then(async value => {
          if (!value) {
            return
          }
          if (value && !value.includes('Update')) {
            return
          } else {
            const updateToNext = value.includes('NEXT')
            await ngUpdate(updateToNext)
          }
        })
    } else {
      const isUpgradeVersionNext = getUpgradeVersion() === UpgradeVersion.Next
      await ngUpdate(isUpgradeVersionNext)
    }
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
