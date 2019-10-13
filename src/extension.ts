import * as vscode from 'vscode'
import { Util } from '../src/common/util'
import { PackageManager, IVersionStatus } from './file/package-manager'
import {
  CheckFrequency,
  UpgradeChannel,
  UpdateCommands,
  PackagesToCheck,
} from './common/enums'
import {
  getUpgradeChannel,
  getUpgradeChannelPreference,
  upgradeChannelExists,
} from './helpers/upgrade-channel.helpers'

import { VersionMenuTask } from './ui/version-menu-task'
import * as open from 'open'
import { AngularUpdate } from './file/angular-update'
import { WorkspaceManager } from './common/workspace-manager'
import { CMD } from './commands/cmd'
import { VersionSkipper } from './helpers/version-to-skip.helpers'
import { CheckFrequencyHelper } from './helpers/check-frequency.helpers'
import { UpdateMenuTask } from './ui/update-menu-task'
import { HelpMenuTask } from './ui/help-menu-task'
import { TerminalManager } from './commands/terminal-manager'
import { AngularUpdater } from './commands/angular-updater'

var workspaceManager: WorkspaceManager
var angularUpdate: AngularUpdate
var packageManager: PackageManager
var cmd: CMD
var versionSkipper: VersionSkipper
const NOW_DATE = new Date()
var isFirstRun: boolean
var checkFrequencyHelper: CheckFrequencyHelper
var terminalManager: TerminalManager
var angularUpdater: AngularUpdater

export function activate(context: vscode.ExtensionContext) {
  console.log('Angular Evergreen is now active!')
  workspaceManager = new WorkspaceManager(vscode, context)
  packageManager = new PackageManager(vscode, workspaceManager)
  cmd = new CMD()
  angularUpdate = new AngularUpdate(vscode, cmd)
  versionSkipper = new VersionSkipper(packageManager, workspaceManager)
  checkFrequencyHelper = new CheckFrequencyHelper(vscode, workspaceManager)
  terminalManager = new TerminalManager(vscode)
  angularUpdater = new AngularUpdater(terminalManager)

  // load commands
  context.subscriptions.push(
    vscode.commands.registerCommand('ng-evergreen.startAngularEvergreen', runEvergreen),
    vscode.commands.registerCommand('ng-evergreen.checkForUpdates', checkForUpdates),
    vscode.commands.registerCommand(
      'ng-evergreen.navigateToUpdateIo',
      navigateToUpdateIo
    ),
    vscode.commands.registerCommand('ng-evergreen.navigateToBlogIo', navigateToBlogIo),
    vscode.commands.registerCommand('ng-evergreen.updateCli', callCliUpdate),
    vscode.commands.registerCommand('ng-evergreen.updateCore', callCoreUpdate),
    vscode.window.registerTreeDataProvider(
      'versions',
      new VersionMenuTask(context, packageManager)
    ),
    vscode.window.registerTreeDataProvider('update', new UpdateMenuTask(context)),
    vscode.window.registerTreeDataProvider('help', new HelpMenuTask(context))
  )

  /* isFirstRun = !workspaceManager.getUpdateFrequency()
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
  } */
}

async function runEvergreen(): Promise<void> {
  if ((await shouldRunEvergreen()) === false) {
    return
  }

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

async function shouldRunEvergreen(): Promise<boolean> {
  const runEvergreenVal = await vscode.window.showInformationMessage(
    'Keep Angular evergreen?',
    {},
    'Check for updates periodically',
    'Cancel'
  )
  return !Util.userCancelled(runEvergreenVal)
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
    if (!versionSkipper.versionToSkipExists()) {
      const shouldUpdate = await versionSkipper.getVersionToSkipPreference()
      if (!!shouldUpdate && shouldUpdate.includes('Update Now')) {
        await doAngularUpdate(coreOutdated, cliOutdated, upgradeChannel)
      }
    } else {
      await doAngularUpdate(coreOutdated, cliOutdated, upgradeChannel)
    }
  } else {
    vscode.window.showInformationMessage('Project is already Evergreen. 🌲 Good job!')
  }
}

async function doAngularUpdate(
  coreOutdated: IVersionStatus,
  cliOutdated: IVersionStatus,
  upgradeChannel: UpgradeChannel
): Promise<void> {
  const versionToSkip = workspaceManager.getVersionToSkip()
  const shouldSkipVersion = versionSkipper.skipVersionCheck(
    upgradeChannel,
    versionToSkip,
    coreOutdated,
    cliOutdated
  )
  if (shouldSkipVersion) {
    vscode.window.showInformationMessage(
      `Skipping update for Angular v${versionToSkip} (${upgradeChannel}).`
    )
  } else {
    await angularUpdate.tryAngularUpdate(upgradeChannel)
  }
}

async function callCliUpdate() {
  await angularUpdater.update(UpdateCommands.ngCliUpdate)
}

async function callCoreUpdate() {
  await angularUpdater.update(UpdateCommands.ngCoreCmd)
}

async function navigateToUpdateIo() {
  await open('https://update.angular.io/')
}

async function navigateToBlogIo() {
  await open('https://blog.angular.io/')
}
