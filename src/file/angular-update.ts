import { CMD } from '../commands/cmd'

import { UpdateArgs, UpgradeChannel, UpdateCommands } from '../common/enums'
import { isGitClean } from './git-manager'
import { read } from 'fs'
import { TerminalManager } from '../common/terminal-manager'

export class AngularUpdater {
  readonly _vscode: any
  readonly _workspace: string
  readonly _cmd: CMD
  readonly _terminalMgr: TerminalManager
  readonly _terminal: any

  constructor(vscode: any, cmd: CMD, terminalMgr: TerminalManager) {
    this._cmd = cmd
    this._vscode = vscode
    this._workspace = vscode.workspace.workspaceFolders![0]
    this._terminalMgr = terminalMgr
    this._terminalMgr.createTerminal('Angular Evergreen 🌲')
  }

  async tryAngularUpdate(upgradeChannel: UpgradeChannel) {
    let gitClean = await isGitClean()
    if (gitClean) {
      await this.ngUpdate(upgradeChannel)
    } else {
      this._vscode.window.showErrorMessage(
        "Can't update: You should ensure git branch is clean & up-to-date."
      )
    }
  }

  async ngUpdate(upgradeChannel: UpgradeChannel): Promise<boolean> {
    const cmdArgs = upgradeChannel === UpgradeChannel.Next ? UpdateArgs.next : ''
    let coreCMD = `${UpdateCommands.ngCoreCmd} ${cmdArgs}`
    let updateCMD = `${UpdateCommands.ngAllCmd} ${cmdArgs}`

    this._terminalMgr.writeToTerminal(
      this._terminal,
      '\x1b[32m 🌲  Welcome to Angular Evergreen 🌲 \r\n\n'
    )

    try {
      await this._cmd.runScript(UpdateCommands.npmInstall, this._terminal)
      await this._cmd.runScript(coreCMD, this._terminal)
      await this._cmd.runScript(
        'git commit -a -m "Updated Angular CLI & Core"',
        this._terminal
      )
      await this._cmd.runScript(updateCMD, this._terminal)
      this._terminalMgr.writeToTerminal(
        this._terminal,
        'Update completed! Project is Evergreen 🌲 Be sure to run your tests and build for prod!'
      )
      return true
    } catch (error) {
      this._terminalMgr.writeToTerminal(
        this._terminal,
        this._cmd.sanitizeStdOut(error.message)
      )
      // check if user wants to force
      this.forceUpdate(this._terminal, `${updateCMD} ${UpdateArgs.force}`)
      return false
    }
  }

  async undo(terminal: any) {
    const gitCmd = 'git reset --hard'
    try {
      this._terminalMgr.writeToTerminal(terminal, 'Undoing changes...')
      await this._cmd.runScript(gitCmd, terminal)
      await this._cmd.runScript(UpdateCommands.npmInstall, terminal)
      this._terminalMgr.writeToTerminal(terminal, 'Changes have been rolled back.')
    } catch (error) {
      this._terminalMgr.writeToTerminal(terminal, this._cmd.sanitizeStdOut(error.message))
    }
  }

  forceUpdate(terminal: any, updateCmd: string) {
    this._vscode.window
      .showErrorMessage(
        "Can't update: Force the update?",
        {},
        'Cancel',
        'Cancel and Remove Uncommitted Files',
        'Force (RISKY)'
      )
      .then(async (value: string) => {
        if (value && value.includes('Force')) {
          try {
            this._terminalMgr.writeToTerminal(terminal, 'May the Force be with you!')
            await this._cmd.runScript(updateCmd, terminal)
            this._terminalMgr.writeToTerminal(
              terminal,
              '🌲  Force Complete 🌲\r\n You will likely have to manually rollback your version of Typescript.\r\nCheck version here https://github.com/angular/angular/blob/master/package.json (or find branch if on next).'
            )
          } catch (error) {
            this._terminalMgr.writeToTerminal(
              terminal,
              this._cmd.sanitizeStdOut(error.message)
            )
          }
        } else if (value && value.includes('Remove')) {
          await this.undo(terminal)
        }
        return
      })
  }
}
