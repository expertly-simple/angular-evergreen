const execa = require('execa');
import * as vscode from 'vscode';
const CLI_CHK_CMD = 'npm info @angular/cli';
const NG_ALL_CMD = 'ng update --all';
const workspace = vscode.workspace.workspaceFolders![0];

export async function updateNg(next: boolean = false) {
  let latest = '';
  let vnext = '';

  let updateCMD = next ? NG_ALL_CMD + ' --next' : NG_ALL_CMD;
  const render = (<any>vscode.window).createTerminalRenderer('Angular Evergreen');
  render.terminal.show();
  render.write('\x1b[32m ~~~~ Welcome to Angular Evergreen ~~~~ \r\n\n');
  try {
    // get latest cli version
    const clistdout = await execa.shell(CLI_CHK_CMD, { cwd: workspace.uri.path });
    latest = getVersionsFromStdout(clistdout.stdout, 'latest');
    vnext = getVersionsFromStdout(clistdout.stdout, 'next');
    render.write(
      `Available @Angular Cli Version: Latest: ${latest} Next: ${vnext} \r\n\n`
    );
    // todo: prompt just cli update here
    // try updatet
    render.write('Running Update - Please Wait.');
    const ngstdout = await execa.shell(updateCMD, { cwd: workspace.uri.path });
    render.write(ngstdout.stdout.message.replace(/[\n\r]/g, ' ').replace('   ', ''));
  } catch (error) {
    let msg = error.message.replace(/[\n\r]/g, ' ').replace('   ', '');
    render.write(msg);
  }
}

function getVersionsFromStdout(stdout: string, versionType: string) {
  const length = 25;
  const sIndex = stdout.indexOf(versionType);
  const roughStr = stdout.substr(sIndex, length);
  const colStr = roughStr.substr(roughStr.indexOf(':') + 1, 6);

  return colStr.trim();
}
