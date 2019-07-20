import * as execa from 'execa'
import * as vscode from 'vscode'

import { UpdateArgs, UpgradeChannel } from '../common/enums'
import { sanitizeStdOut, writeToTerminal } from '../common/common.helpers'

import { isGitClean } from './git-manager'

const NG_CORE_CMD = 'npx ng update @angular/cli @angular/core'
const NG_ALL_CMD = 'npx ng update --all'
const workspace = vscode.workspace.workspaceFolders![0]

export async function tryAngularUpdate(upgradeChannel: UpgradeChannel) {
  let gitClean = await isGitClean()
  if (gitClean) {
    await ngUpdate(upgradeChannel)
  } else {
    vscode.window.showErrorMessage(
      "Can't update: You should ensure git branch is clean & up-to-date."
    )
  }
}

export async function ngUpdate(upgradeChannel: UpgradeChannel): Promise<boolean> {
  const cmdArgs = upgradeChannel === UpgradeChannel.Next ? UpdateArgs.next : ''
  let coreCMD = `${NG_CORE_CMD} ${cmdArgs}`
  let updateCMD = `${NG_ALL_CMD} ${cmdArgs}`

  const renderer = (<any>vscode.window).createTerminalRenderer('Angular Evergreen 🌲')
  renderer.terminal.show()
  renderer.write('\x1b[32m 🌲  Welcome to Angular Evergreen 🌲 \r\n\n')

  try {
    await runScript(renderer, 'npm install')
    await runScript(renderer, coreCMD)
    await runScript(renderer, 'git commit -a -m "Updated Angular CLI & Core"')
    await runScript(renderer, updateCMD)
    writeToTerminal(
      renderer,
      'Update completed! Project is Evergreen 🌲 Be sure to run your tests and build for prod!'
    )
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
  const scriptStdout = await execa.command(script, {
    cwd: workspace.uri.fsPath,
    windowsVerbatimArguments: true,
  })
  const rendererText = sanitizeStdOut(scriptStdout.stdout)
  writeToTerminal(renderer, rendererText)
}

async function undo(renderer: any) {
  const cmd = 'git reset --hard'
  try {
    writeToTerminal(renderer, 'Undoing changes...')
    await runScript(renderer, cmd)
    await runScript(renderer, 'npm install')
    writeToTerminal(renderer, 'Changes have been rolled back.')
  } catch (error) {
    writeToTerminal(renderer, sanitizeStdOut(error.message))
  }
}

function forceUpdate(renderer: any, cmd: string) {
  vscode.window
    .showErrorMessage(
      "Can't update: Do you want to try and force the update?",
      {},
      'Cancel',
      'Cancel and Remove Uncommitted Files',
      'Force (RISKY)'
    )
    .then(async value => {
      if (value && value.includes('Force')) {
        try {
          writeToTerminal(renderer, 'May the Force be with you!')
          await runScript(renderer, cmd)
          writeToTerminal(
            renderer,
            '🌲  Force Complete 🌲\r\n You will likely have to manually rollback your version of Typescript.\r\nCheck version here https://github.com/angular/angular/blob/master/package.json (or find branch if on next).'
          )
        } catch (error) {
          writeToTerminal(renderer, sanitizeStdOut(error.message))
        }
      } else if (value && value.includes('Remove')) {
        await undo(renderer)
      }
      return
    })
}
