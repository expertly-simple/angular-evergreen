import * as execa from 'execa'
import * as vscode from 'vscode'

const NPM_INSTALL_CMD = 'npm install'
const NG_ALL_LATEST_CMD = 'ng update --all'
const NG_ALL_NEXT_CMD = NG_ALL_LATEST_CMD + ' --next'
const workspace = vscode.workspace.workspaceFolders![0]

export async function runNgUpdate(shouldUpdateToNext: boolean = false): Promise<boolean> {
  const terminal = (<any>vscode.window).createTerminalRenderer('Angular Evergreen 🌲')
  terminal.terminal.show()
  terminal.write('\x1b[32m 🌲  Welcome to Angular Evergreen 🌲 \r\n\n')

  try {
    await runScript(terminal, NPM_INSTALL_CMD)
    await runScript(terminal, shouldUpdateToNext ? NG_ALL_NEXT_CMD : NG_ALL_LATEST_CMD)
    return true
  } catch (error) {
    let msg = error.message.replace(/[\n\r]/g, ' ').replace('   ', '')
    terminal.write(msg)
    return false
  }
}

async function runScript(render: any, script: string) {
  render.write(`Executing: ${script}\r\n`)
  const scriptStdout = await execa.shell(script, { cwd: workspace.uri.path })
  render.write(scriptStdout.stdout.replace(/[\n\r]/g, ' ').replace('   ', ''))
  render.write('\r\n')
}
