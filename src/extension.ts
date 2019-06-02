// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getDevDependencies, checkUpdateAngularCli } from './file/package-manager';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "ng-evergreen" is now active!');

  // Angular Evergreen
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.angularEvergreen', () => {
      let options: vscode.MessageOptions = {};
      vscode.window
        .showInformationMessage('Run Angular Evergreen?', {}, 'Run', 'Cancel')
        .then(value => {
          if (value !== 'Run') {
            return;
          } else {
            const terminal = vscode.window.createTerminal(`Angular Evergreen`);
            terminal.show();
            terminal.sendText('ng version');
          }
        });
    })
  );
  let angCliVer = await getDevDependencies();
  let outdated = await checkUpdateAngularCli(angCliVer);

  if (outdated) {
    vscode.window.showInformationMessage(
      'Angular is outdated. Update?',
      {},
      'Run',
      'Cancel'
    );
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
