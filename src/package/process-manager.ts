const execa = require('execa');
import * as vscode from 'vscode';
const NG_CMD = 'ng';
const workspace = vscode.workspace.workspaceFolders![0];

export async function updateNgPacks(next: boolean = false) {
  let args = ['update', '--all'];
  const terminal = vscode.window.createTerminal(`Angular Evergreen`);
  try {
    terminal.show();
    let stdout = await execa.shell('ng update --all', { cwd: workspace.uri.path });
    terminal.sendText(stdout);
  } catch (error) {
    terminal.sendText(error);
  }
}
