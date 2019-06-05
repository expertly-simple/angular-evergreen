const execa = require('execa');
import * as vscode from 'vscode';
const NG_CMD = 'ng';
const workspace = vscode.workspace.workspaceFolders![0];

export async function updateNg(next: boolean = false) {
  const updateAll = 'ng update --all';
  const terminal = vscode.window.createTerminal(`Angular Evergreen`);

  let updateCMD = next ? updateAll + ' --next' : updateAll;
  terminal.show();
  terminal.sendText(updateCMD);
  try {
    let stdout = await execa.shell(updateCMD, { cwd: workspace.uri.path });
    terminal.sendText(stdout);
  } catch (error) {
    terminal.sendText(error);
  }
}
