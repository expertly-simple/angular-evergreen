// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { getDevDependencies, checkUpdateAngularCli } from './file/package-manager';
import { isGitClean } from './file/git-manager';

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
        .showInformationMessage(
          'Angular Evergreen: Run Angular Evergreen?',
          {},
          'Run',
          'Cancel'
        )
        .then(async value => {
          if (value !== 'Run') {
            return;
          } else {
            let gitClean = await isGitClean();
            if (gitClean) {
              vscode.window.showInformationMessage('Angular Evergreen: Git is clean');
              let angCliVer = await getDevDependencies();
              let outdated = await checkUpdateAngularCli(angCliVer);

              if (outdated) {
                vscode.window.showInformationMessage(
                  'Angular Evergreen: Angular is outdated. Update?',
                  {},
                  'Run',
                  'Cancel'
                );
              }
            } else {
              vscode.window.showErrorMessage(
                'Angular Evergreen: Please ensure your branch is clean and up to date with remote'
              );
            }
          }
        });
    })
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}
