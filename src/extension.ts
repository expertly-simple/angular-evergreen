import * as vscode from 'vscode'

import { VsCodeCommands } from './commands/allCommands'
import { CheckFrequency, EvergreenCommand } from './common/enums'
import { VersionManager, VersionManagerInstance } from './helpers/versionManager'
import { WorkspaceManagerInstance } from './helpers/workspaceManager'
import { HelpMenuTask } from './ui/helpMenuTask'
import { UpdateMenuTask } from './ui/updateMenuTask'
import { VersionMenuTask } from './ui/versionMenuTask'

let versionTreeTask: VersionMenuTask

export async function activate(context: vscode.ExtensionContext) {
  console.log('Angular Evergreen is now active!')

  WorkspaceManagerInstance.context = context

  await configureVersionManager(context, VersionManagerInstance)

  // load commands
  VsCodeCommands.forEach(command => context.subscriptions.push(command))

  context.subscriptions.push(
    vscode.commands.registerCommand(
      EvergreenCommand.checkForUpdatesTree.toString(),
      checkForUpdatesTree
    ),
    vscode.window.registerTreeDataProvider('update', new UpdateMenuTask(context)),
    vscode.window.registerTreeDataProvider('help', new HelpMenuTask(context))
  )
}

async function configureVersionManager(
  context: vscode.ExtensionContext,
  versionManager: VersionManager
) {
  versionManager.on('IsEvergreen', status => {
    vscode.window.showInformationMessage(
      status
        ? 'Project is already Evergreen. 🌲 Good job!'
        : 'Angular is out-of-date! Run 🌲 Quick Command > Update Angular to upgrade.'
    )
  })

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

  const isFirstRun = !WorkspaceManagerInstance.getUpdateFrequency()
  if (isFirstRun) {
    vscode.commands.executeCommand(EvergreenCommand.startEvergreen.toString())
  } else if (WorkspaceManagerInstance.getUpdateFrequency() !== CheckFrequency.OnLoad) {
    await versionManager.checkForUpdates()
  }
}

async function checkForUpdatesTree() {
  vscode.window.showInformationMessage('Checking for the latest versions...')
  await VersionManagerInstance.checkForUpdates()
  if (versionTreeTask) {
    await versionTreeTask.getChildren()
  }
}
