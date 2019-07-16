import * as execa from 'execa'
import * as vscode from 'vscode'

import { sanitizeStdOut, writeToTerminal } from '../common/common.helpers'

import { UpdateArgs } from '../common/enums'
import { isGitClean } from './git-manager'

const NG_ALL_CMD = 'ng update --all '
const workspace = vscode.workspace.workspaceFolders![0]

export async function tryAngularUpdate(updateArgs: UpdateArgs[]) {
  let gitClean = await isGitClean()
  if (gitClean) {
    await ngUpdate(updateArgs)
  } else {
    vscode.window.showErrorMessage(
      "Can't update: You should ensure git branch is clean & up-to-date."
    )
  }
}

export async function ngUpdate(args?: UpdateArgs[]): Promise<boolean> {
  let updateCMD = NG_ALL_CMD + (args ? args.join(' ') : '')

  const renderer = (<any>vscode.window).createTerminalRenderer('Angular Evergreen 🌲')
  renderer.terminal.show()
  renderer.write('\x1b[32m 🌲  Welcome to Angular Evergreen 🌲 \r\n\n')

  try {
    await runScript(renderer, 'npm install')
    await runScript(renderer, updateCMD)
    writeToTerminal(renderer, 'Update completed! Project is Evergreen 🌲')
    return true
  } catch (error) {
    writeToTerminal(renderer, sanitizeStdOut(error.message))
    // check if user wants to force
    forceUpdate(renderer, `${updateCMD} ${UpdateArgs.force}`)
    return false
  }
}

async function runScript(renderer: any, script: string) {
  writeToTerminal(renderer, `Executing: ${script}`)
  const scriptStdout = await execa.command(script, { cwd: workspace.uri.path })
  const rendererText = sanitizeStdOut(scriptStdout.stdout)
  writeToTerminal(renderer, rendererText)
}

function forceUpdate(renderer: any, cmd: string) {
  vscode.window
    .showErrorMessage(
      "Can't update: Do you want to try and force the update?",
      {},
      'Cancel',
      'Force (RISKY)'
    )
    .then(async value => {
      if (value && value.includes('Force')) {
        try {
          writeToTerminal(renderer, 'May the Force be with you!')
          await runScript(renderer, cmd)
          writeToTerminal(renderer, '🌲  Force Complete 🌲')
        } catch (error) {
          writeToTerminal(renderer, sanitizeStdOut(error.message))
        }
      }
      return
    })
}
