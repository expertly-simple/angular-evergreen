// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getDevDependencies, checkUpdateAngularCli } from './file/package-manager';
import { updateNg } from './package/angular-update';
import { isMainThread } from 'worker_threads';
import { on } from 'cluster';
const ONE_HOUR = 3600000;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "ng-evergreen" is now active!');

  // Angular Evergreen
  context.subscriptions.push(
    // todo: manual commands here.

    // not sure we need the below?
    vscode.commands.registerCommand('extension.angularEvergreen', () => {
      let options: vscode.MessageOptions = {};
    })
  );

  await mainFunc();

  // start 24hr reminder...
  setTimeout(mainFunc, ONE_HOUR * 24);
}

async function mainFunc() {
  let angCliVer = await getDevDependencies();
  let outdated = await checkUpdateAngularCli(angCliVer);

  if (outdated) {
    vscode.window
      .showInformationMessage('Angular is outdated. Update?', {}, 'Run', 'Cancel')
      .then(data => {
        if (data === 'Run') {
          updateNg();
        }
      });
  }
}
// this method is called when your extension is deactivated
export function deactivate() {}
