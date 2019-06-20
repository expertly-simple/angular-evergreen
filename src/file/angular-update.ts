import * as execa from 'execa'
import * as vscode from 'vscode'

import {
  storeUpgradeVersion,
  upgradeVersionExists,
} from '../common/upgrade-version.helpers'

const NG_ALL_CMD = 'ng update --all'
const workspace = vscode.workspace.workspaceFolders![0]

export async function ngUpdate(next: boolean = false): Promise<boolean> {
  if (!upgradeVersionExists()) {
    storeUpgradeVersion(next)
  }

  let updateCMD = next ? NG_ALL_CMD + ' --next' : NG_ALL_CMD
  const render = (<any>vscode.window).createTerminalRenderer('Angular Evergreen 🌲')
  render.terminal.show()
  render.write('\x1b[32m 🌲  Welcome to Angular Evergreen 🌲 \r\n\n')
  try {
    await runScript(render, 'npm install')
    await runScript(render, updateCMD)
    return true
  } catch (error) {
    let msg = error.message.replace(/[\n\r]/g, ' ').replace('   ', '')
    render.write(msg)
    return false
  }
}

async function runScript(render: any, script: string) {
  render.write(`Executing: ${script}\r\n`)
  const scriptStdout = await execa.shell(script, { cwd: workspace.uri.path })
  render.write(scriptStdout.stdout.replace(/[\n\r]/g, ' ').replace('   ', ''))
  render.write('\r\n')
}
