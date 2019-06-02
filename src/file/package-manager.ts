import * as vscode from 'vscode';

const fs = require('fs');
const latestVersion = require('latest-version');
const workspace = vscode.workspace.workspaceFolders![0];
const ANG_CLI = '@angular/cli';

export async function getDevDependencies() {
  let packjsonFile = await vscode.workspace.findFiles(
    new vscode.RelativePattern(workspace, 'package.json')
  );

  if (packjsonFile.length <= 0) {
    vscode.window.showErrorMessage('File package.json not found');
  }

  let filedata = fs.readFileSync(packjsonFile[0].path);

  if (!filedata) {
    vscode.window.showErrorMessage('File package.json is empty or corrupt');
  }

  let devDeps = JSON.parse(filedata).devDependencies;

  let version = devDeps[ANG_CLI];

  if (!version) {
    vscode.window.showInformationMessage('@angular/cli could not be found');
  }

  return version;
}

export async function checkUpdateAngularCli(version: string) {
  let newVersion = await latestVersion(ANG_CLI);
  version = version.replace('~', '').replace('^', '');

  return version[0] < newVersion[0];
}
