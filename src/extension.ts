import * as open from 'open'
import * as vscode from 'vscode'

import { Util } from '../src/common/util'
import { CMD } from './commands/cmd'
import { TerminalManager } from './commands/terminal-manager'
import {
  CheckFrequency,
  PackagesToCheck,
  UpdateCommands,
  UpgradeChannel,
} from './common/enums'
import { WorkspaceManager } from './common/workspace-manager'
import { CheckFrequencyHelper } from './helpers/check-frequency.helpers'
import {
  getUpgradeChannel,
  getUpgradeChannelPreference,
  upgradeChannelExists,
} from './helpers/upgrade-channel.helpers'
import { VersionSkipper } from './helpers/version-to-skip.helpers'
import { HelpMenuTask } from './ui/help-menu-task'
import { UpdateMenuTask } from './ui/update-menu-task'
import { VersionMenuTask } from './ui/version-menu-task'
import { AngularUpdate } from './updaters/angular-update'
import { IVersionStatus, PackageManager } from './updaters/package-manager'

let workspaceManager: WorkspaceManager
let angularUpdate: AngularUpdate
let packageManager: PackageManager
let cmd: CMD
let versionSkipper: VersionSkipper
const NOW_DATE = new Date()
let isFirstRun: boolean
let checkFrequencyHelper: CheckFrequencyHelper
let terminalManager: TerminalManager

export function activate(context: vscode.ExtensionContext) {
  console.log('Angular Evergreen is now active!')
  workspaceManager = new WorkspaceManager(vscode, context)
  packageManager = new PackageManager(vscode, workspaceManager)
  cmd = new CMD()
  angularUpdate = new AngularUpdate(vscode, cmd)
  versionSkipper = new VersionSkipper(packageManager, workspaceManager)
  checkFrequencyHelper = new CheckFrequencyHelper(vscode, workspaceManager)
  terminalManager = new TerminalManager(vscode)

  // load commands
  context.subscriptions.push(
    vscode.commands.registerCommand('ng-evergreen.startAngularEvergreen', runEvergreen),
    vscode.commands.registerCommand('ng-evergreen.checkForUpdates', checkForUpdates),
    vscode.commands.registerCommand(
      'ng-evergreen.navigateToUpdateIo',
      navigateToUpdateIo
    ),
    vscode.commands.registerCommand('ng-evergreen.navigateToBlogIo', navigateToBlogIo),
    vscode.commands.registerCommand('ng-evergreen.updateAngular', callUpdateAngular),
    vscode.commands.registerCommand('ng-evergreen.updateAll', callAngularAll),
    vscode.commands.registerCommand(
      'ng-evergreen.navigateToConsultingForm',
      navigateToRequestForm
    ),
    vscode.window.registerTreeDataProvider(
      'versions',
      new VersionMenuTask(context, packageManager)
    ),
    vscode.window.registerTreeDataProvider('update', new UpdateMenuTask(context)),
    vscode.window.registerTreeDataProvider('help', new HelpMenuTask(context))
  )

  isFirstRun = !workspaceManager.getUpdateFrequency()
  if (isFirstRun) {
    vscode.commands.executeCommand('ng-evergreen.startAngularEvergreen')
  } else if (workspaceManager.getUpdateFrequency() !== CheckFrequency.OnLoad) {
    // update existing peeps to Daily.
    workspaceManager.setUpdateFrequency('Daily')
    if (checkFrequencyHelper.checkFrequencyBeforeUpdate()) {
      vscode.commands.executeCommand('ng-evergreen.checkForUpdates')
    }
  } else if (workspaceManager.getUpdateFrequency() === CheckFrequency.OnLoad) {
    vscode.commands.executeCommand('ng-evergreen.checkForUpdates')
  }
}

async function runEvergreen(): Promise<void> {
  if (isFirstRun) {
    const checkFrequencyInput = await checkFrequencyHelper.getCheckFrequencyPreference()
    if (Util.userCancelled(checkFrequencyInput)) {
      return
    }
  }

  if (!upgradeChannelExists()) {
    const upgradeChannelInput = await getUpgradeChannelPreference()
  }

  workspaceManager.setLastUpdateCheckDate(new Date())
  await checkForUpdates()
}

async function checkForUpdates(): Promise<void> {
  const upgradeChannel = getUpgradeChannel()
  const coreOutdated = await packageManager.checkForUpdate(
    PackagesToCheck.core,
    upgradeChannel
  )
  const cliOutdated = await packageManager.checkForUpdate(
    PackagesToCheck.cli,
    upgradeChannel
  )
  if (cliOutdated.needsUpdate || coreOutdated.needsUpdate) {
  } else {
    vscode.window.showInformationMessage('Project is already Evergreen. 🌲 Good job!')
  }
}

async function callUpdateAngular() {
  await terminalManager.writeToTerminal(UpdateCommands.ngCoreCliUpdate)
}

async function callAngularAll() {
  await terminalManager.writeToTerminal(UpdateCommands.ngAllCmd)
}

async function navigateToUpdateIo() {
  await open('https://update.angular.io/')
}

async function navigateToRequestForm() {
  await open('https://expertlysimple.io/expertly-simple-consulting-request/')
}

async function navigateToBlogIo() {
  await open('https://blog.angular.io/')
}
