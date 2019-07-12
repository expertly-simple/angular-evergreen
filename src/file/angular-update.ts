import * as execa from 'execa'
import * as vscode from 'vscode'

import { clearVersionToSkip } from '../common/version-to-skip.helpers'
import { isGitClean } from './git-manager'

const NPM_INSTALL_CMD = 'npm install'
const NG_ALL_LATEST_CMD = 'ng update --all'
const NG_ALL_NEXT_CMD = NG_ALL_LATEST_CMD + ' --next'
const workspace = vscode.workspace.workspaceFolders![0]

export async function tryUpdate(shouldUpdateToNext: boolean): Promise<void> {
  const gitClean = await isGitClean()
  if (gitClean) {
    const status = await runNgUpdate(shouldUpdateToNext)
    let message = ''
    if (status) {
      message = 'Update completed! Project is Evergreen 🌲'
      clearVersionToSkip()
    } else {
      message = 'Hmm... That didn\'t work. Try executing "ng update --all --force"'
    }
    vscode.window.showInformationMessage(message)
  } else {
    vscode.window.showErrorMessage(
      "Can't update. You should ensure your git branch is clean & up-to-date"
    )
  }
}

async function runNgUpdate(shouldUpdateToNext: boolean = false): Promise<boolean> {
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

async function runScript(render: any, script: string, format: boolean = true) {
  render.write(`Executing: ${script}\r\n`)
  const scriptStdout = await execa.shell(script, { cwd: workspace.uri.path })
  const renderText = format
    ? scriptStdout.stdout.replace(/[\n\r]/g, ' ').replace(/\s+/, '')
    : scriptStdout.stdout
  render.write(renderText)
  render.write('\r\n')
}

function checkStringForErrors(inString: string): boolean {
  return (
    inString.includes('Error') ||
    inString.includes('ERROR') ||
    inString.includes('Fail') ||
    inString.includes('failed')
  )
}

function forceUpdate(render: any, cmd: string) {
  vscode.window
    .showErrorMessage(
      "Can't update: Do you want to try and force the update?",
      {},
      'CANCEL',
      'FORCE (risky)'
    )
    .then(async value => {
      if (!value || value === '') {
        return
      } else {
        if (value.includes('FORCE')) {
          try {
            render.write('\r\n\r\nMay the Force be with you! \r\n')
            await runScript(render, cmd)
          } catch (error) {
            let msg = error.message.replace(/[\n\r]/g, ' ').replace(/\s+/, '')
            render.write(`\r\n ${msg} \r\n 🌲 Force Complete 🌲\r\n`)
          }
        }
        return
      }
    })
}
