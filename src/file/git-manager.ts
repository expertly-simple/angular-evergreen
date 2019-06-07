import * as vscode from 'vscode';

export async function isGitClean(): Promise<Boolean> {
  const terminal = vscode.window.createTerminal(`Angular Evergreen`);
  terminal.show();
  terminal.sendText('git status');
  let output = '';
  let datawatcher = (<any>terminal).onDidWriteData((data: string) => {
    output += data;
  });

  var promise = new Promise<Boolean>(function(resolve) {
    setTimeout(() => {
      if (
        output.includes('Changes') ||
        output.includes('Untracked') ||
        output.includes('ahead') ||
        output.includes('behind')
      ) {
        resolve(false);
      } else {
        resolve(true);
      }
      terminal.dispose();
    }, 1000);
  });
  return promise;
}
