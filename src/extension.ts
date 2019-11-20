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
import { VersionManager } from './common/version-manager'
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
let isFirstRun: boolean
let checkFrequencyHelper: CheckFrequencyHelper
let terminalManager: TerminalManager
let versionManager: VersionManager
let versionTreeTask: VersionMenuTask

export async function activate(context: vscode.ExtensionContext) {
  console.log('Angular Evergreen is now active!')
  workspaceManager = new WorkspaceManager(vscode, context)
  packageManager = new PackageManager(vscode, workspaceManager)
  versionManager = new VersionManager(packageManager, workspaceManager)
  cmd = new CMD()
  angularUpdate = new AngularUpdate(vscode, cmd)
  versionSkipper = new VersionSkipper(packageManager, workspaceManager)
  checkFrequencyHelper = new CheckFrequencyHelper(vscode, workspaceManager)
  terminalManager = new TerminalManager(vscode)

  versionManager.on('IsEvergreen', status => {
    if (!status) {
      vscode.window.showInformationMessage('Project is already Evergreen. 🌲 Good job!')
    }
  })

  // load commands
  context.subscriptions.push(
    vscode.commands.registerCommand('ng-evergreen.startAngularEvergreen', runEvergreen),
    vscode.commands.registerCommand(
      'ng-evergreen.checkForUpdates',
      versionManager.checkForUpdates
    ),
    vscode.commands.registerCommand(
      'ng-evergreen.checkForUpdatesTree',
      checkForUpdatesTree
    ),
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
    vscode.window.registerTreeDataProvider('update', new UpdateMenuTask(context)),
    vscode.window.registerTreeDataProvider('help', new HelpMenuTask(context))
  )

  // this makes the version tree task event driven for performance.
  versionManager.on('VersionCheckComplete', () => {
    const versions = {
      coreVersion: versionManager.coreVersion,
      cliVersion: versionManager.cliVersion,
    }

    versionTreeTask = new VersionMenuTask(context, versionManager, versions)

    context.subscriptions.push(
      vscode.window.registerTreeDataProvider('versions', versionTreeTask)
    )
  })

  isFirstRun = !workspaceManager.getUpdateFrequency()
  if (isFirstRun) {
    vscode.commands.executeCommand('ng-evergreen.startAngularEvergreen')
  } else if (workspaceManager.getUpdateFrequency() !== CheckFrequency.OnLoad) {
    await versionManager.checkForUpdates()
  }
}

async function runEvergreen(): Promise<void> {
  await versionManager.checkForUpdates()

  if (!upgradeChannelExists()) {
    const upgradeChannelInput = await getUpgradeChannelPreference()
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

async function checkForUpdatesTree() {
  await versionManager.checkForUpdates()
  if (versionTreeTask) {
    await versionTreeTask.getChildren()
  }
}
