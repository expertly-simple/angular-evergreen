const execa = require('execa');
import * as vscode from 'vscode';
const NG_CMD = 'ng';
const CLI_CHK_CMD = 'npm info @angular/cli';
const workspace = vscode.workspace.workspaceFolders![0];

export async function updateNg(next: boolean = false) {
  const updateAll = 'ng update --all';
  const terminal = vscode.window.createTerminal(`Angular Evergreen`);
  let latest = '';
  let vnext = '';

  let updateCMD = next ? updateAll + ' --next' : updateAll;
  terminal.show();

  try {
    const clistdout = await execa.shell(CLI_CHK_CMD, { cwd: workspace.uri.path });
    latest = getVersionsFromStdout(clistdout.stdout, 'latest');
    vnext = getVersionsFromStdout(clistdout.stdout, 'next');
    const ngstdout = await execa.shell(updateCMD, { cwd: workspace.uri.path });
    const message = ngstdout.stdout.message.replace('//n', '');
    terminal.sendText(message);
  } catch (error) {
    const message = error.message.replace('//n', '');
    terminal.sendText(message);
  }

  // todo allow user to choose version to update.
  vscode.window.showInformationMessage(
    `Available @Angular Cli Version: Latest: ${latest} Next: ${vnext}`
  );
}

function getVersionsFromStdout(stdout: string, versionType: string) {
  const length = 25;
  const sIndex = stdout.indexOf(versionType);

  const roughStr = stdout.substr(sIndex, length);
  const colStr = roughStr.substr(roughStr.indexOf(':') + 1, 6);

  return colStr.trim();
}
