const execa = require('execa');
import * as vscode from 'vscode';
const NG_CMD = 'ng';
const CLI_CHK_CMD = 'npm info @angular/cli';
const workspace = vscode.workspace.workspaceFolders![0];

export async function updateNg(next: boolean = false) {
  const updateAll = 'ng update --all';
  let latest = '';
  let vnext = '';

  let updateCMD = next ? updateAll + ' --next' : updateAll;
  const render = (<any>vscode.window).createTerminalRenderer('Angular Evergreen');
  render.terminal.show();
  render.write('~~~~ Welcome to Angular Evergreen ~~~~ \r\n\n todo: more info here?');
  try {
    const clistdout = await execa.shell(CLI_CHK_CMD, { cwd: workspace.uri.path });
    latest = getVersionsFromStdout(clistdout.stdout, 'latest');
    vnext = getVersionsFromStdout(clistdout.stdout, 'next');
    const ngstdout = await execa.shell(updateCMD, { cwd: workspace.uri.path });
    render.write(ngstdout.stdout.message.replace('\n', '\r\n\n'));
  } catch (error) {
    render.write(error.message.replace('\n', '\r\n\n'));
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
