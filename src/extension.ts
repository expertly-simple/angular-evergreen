import * as vscode from 'vscode'

import { ANG_CLI, ANG_CORE, checkForUpdate, IVersionStatus } from './file/package-manager'
import {
  CHECK_FREQUENCY_KEY,
  getCheckFrequency,
  getCheckFrequencyMilliseconds,
} from './common/check-frequency.helpers'

import { CheckFrequency } from './common/enums'
import { tryAngularUpdate, UpdateArgs } from './file/angular-update'
import {
  upgradeVersionExists,
  storeUpgradeVersion,
} from './common/upgrade-version.helpers'

import { TaskProvider } from './nodeDependency'
import * as open from 'open'

export function activate(context: vscode.ExtensionContext) {
  console.log('Angular Evergreen is now active!')

  context.subscriptions.push(
    vscode.commands.registerCommand('ng-evergreen.angularEvergreen', runEvergreen),
    vscode.commands.registerCommand('ng-evergreen.stopAngularEvergreen', stopEvergreen),
    vscode.commands.registerCommand('ng-evergreen.checkForUpdates', checkAngularVersions),
    vscode.commands.registerCommand(
      'ng-evergreen.navigateToUpdateIo',
      navigateToUpdateIo
    ),
    vscode.window.registerTreeDataProvider('evergreen', new TaskProvider(context))
  )

  // run it
  const isFirstRun = !getCheckFrequency() || getCheckFrequency() === ''
  if (isFirstRun) {
    vscode.commands.executeCommand('ng-evergreen.angularEvergreen')
  } else if (getCheckFrequency() === 'On Load') {
    checkAngularVersions()
  } else {
    startJob()
  }
}

async function navigateToUpdateIo() {
  await open('https://update.angular.io/')
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
        if (getCheckFrequency() !== 'On Load') {
          startJob()
        }
      } else {
        return
      }
    })
}

async function setCheckFrequency() {
  await vscode.window
    .showInformationMessage(
      'How often would you like to check for updatess (this can be changed in settings.json)?',
      {},
      CheckFrequency.OnLoad,
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
    showUpdateModal(coreOutdated)
  } else {
    vscode.window.showInformationMessage('Project is already evergreen 🌲 Good job!')
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
        const isNext = value.includes('NEXT')
        if (!upgradeVersionExists()) {
          storeUpgradeVersion(isNext)
        }
        await tryAngularUpdate(isNext ? [UpdateArgs.next] : [])
      }
    })
}

export function deactivate() {
  console.log('Angular Evergreen is deactive.')
  stopEvergreen()
}
