import * as open from 'open'
import * as vscode from 'vscode'

import { TerminalManager } from './commands/terminal-manager'
import { CheckFrequency, UpdateArgs, UpdateCommands } from './common/enums'
import { VersionManager } from './common/version-manager'
import { WorkspaceManager } from './common/workspace-manager'
import { HelpMenuTask } from './ui/help-menu-task'
import { UpdateMenuTask } from './ui/update-menu-task'
import { VersionMenuTask } from './ui/version-menu-task'
import { PackageManager } from './updaters/package-manager'

let workspaceManager: WorkspaceManager
let packageManager: PackageManager
let terminalManager: TerminalManager
let versionManager: VersionManager

let isFirstRun: boolean
let versionTreeTask: VersionMenuTask

export async function activate(context: vscode.ExtensionContext) {
  console.log('Angular Evergreen is now active!')

  workspaceManager = new WorkspaceManager(vscode, context)
  packageManager = new PackageManager(vscode, workspaceManager)
  terminalManager = new TerminalManager(vscode)
  versionManager = new VersionManager(packageManager, workspaceManager)

  versionManager.on('IsEvergreen', status => {
    if (status === true) {
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
      'ng-evergreen.updateAngularNext',
      callUpdateAngularNext
    ),
    vscode.commands.registerCommand('ng-evergreen.updateAllNext', callAngularAllNext),
    vscode.commands.registerCommand(
      'ng-evergreen.updateAllNextForce',
      callAngularAllNextForce
    ),
    vscode.commands.registerCommand(
      'ng-evergreen.viewAvailableUpdates',
      viewAvailableUpdates
    ),
    vscode.commands.registerCommand(
      'ng-evergreen.runPostUpdateCheckup',
      runPostUpdateCheckup
    ),
    vscode.commands.registerCommand(
      'ng-evergreen.configureAngularVsCode',
      configureAngularVsCode
    ),
    vscode.commands.registerCommand(
      'ng-evergreen.viewAvailableUpdatesNext',
      viewAvailableUpdatesNext
    ),
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
}

async function callUpdateAngular() {
  await terminalManager.writeToTerminal(UpdateCommands.ngCoreCliUpdate)
}

async function callAngularAll() {
  await terminalManager.writeToTerminal(UpdateCommands.ngAllCmd)
}

async function callUpdateAngularNext() {
  await terminalManager.writeToTerminal(
    `${UpdateCommands.ngCoreCliUpdate} ${UpdateArgs.next}`
  )
}

async function callAngularAllNext() {
  await terminalManager.writeToTerminal(`${UpdateCommands.ngAllCmd} ${UpdateArgs.next}`)
}

async function callAngularAllNextForce() {
  await terminalManager.writeToTerminal(
    `${UpdateCommands.ngAllCmd} ${UpdateArgs.next} ${UpdateArgs.force}`
  )
}

async function viewAvailableUpdates() {
  await terminalManager.writeToTerminal(`${UpdateCommands.ngUpdate}`)
}

async function viewAvailableUpdatesNext() {
  await terminalManager.writeToTerminal(`${UpdateCommands.ngUpdate} ${UpdateArgs.next}`)
}

function runPostUpdateCheckup() {
  const terminal = terminalManager.getTerminal()
  terminal.sendText(`npm i -g rimraf`)
  terminal.sendText(`rimraf node_modules`)
  terminal.sendText(`npm install`)
  terminal.sendText(`npx ng test --watch=false`)
  terminal.sendText(`npx ng build --prod`)
}

function configureAngularVsCode() {
  const terminal = terminalManager.getTerminal()
  terminal.sendText(`npm i -g mrm-task-angular-vscode`)
  terminal.sendText(`npx mrm angular-vscode`)
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
