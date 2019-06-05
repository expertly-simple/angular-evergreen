import * as vscode from 'vscode';

import fs = require('fs');
import latestVersion = require('latest-version');

const ANG_CLI = '@angular/cli';

export function getWorkspace() {
  if (vscode.workspace) {
    return vscode.workspace.workspaceFolders &&
      vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0]
      : null;
  }

  return null;
}

export async function getDevDependencies() {
  // sanity check that a workspace is loaded
  const workspace = getWorkspace();
  if (!workspace) {
    console.error('No workspace found.');
    return;
  }

  let packjsonFile = await vscode.workspace.findFiles(
    new vscode.RelativePattern(workspace, 'package.json')
  );

  if (!packjsonFile || packjsonFile.length <= 0) {
    vscode.window.showErrorMessage('File package.json not found');
  }

  let filedata = fs.readFileSync(packjsonFile[0].fsPath);

  if (!filedata) {
    vscode.window.showErrorMessage('File package.json is empty or corrupt');
  }

  let devDeps = JSON.parse(filedata.toString()).devDependencies;

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
