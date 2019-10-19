import { UpdateArgs, UpdateCommands, UpgradeChannel } from '../common/enums'

import { CMD } from '../commands/cmd'
import { Terminal } from 'vscode'
import { onCleanGitBranch } from './git-manager'

export class AngularUpdater {
  readonly _vscode: any
  readonly _workspace: string
  readonly _cmd: CMD
  readonly _renderer: Terminal

  constructor(vscode: any, cmd: CMD) {
    this._cmd = cmd
    this._vscode = vscode
    this._workspace = vscode.workspace.workspaceFolders![0]
    this._renderer = this._vscode.window.createTerminal('Angular Evergreen 🌲')
  }

  async tryAngularUpdate(upgradeChannel: UpgradeChannel) {
    if (onCleanGitBranch()) {
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

    this._renderer.show()
    // this._renderer.sendText('\x1b[32m 🌲  Welcome to Angular Evergreen 🌲 \r\n\n')
    this._renderer.sendText('🌲  Welcome to Angular Evergreen 🌲 \r\n\n')

    try {
      await this._cmd.runScript(UpdateCommands.npmInstall, this._renderer)
      await this._cmd.runScript(coreCMD, this._renderer)
      await this._cmd.runScript(
        'git commit -a -m "Updated Angular CLI & Core"',
        this._renderer
      )
      await this._cmd.runScript(updateCMD, this._renderer)
      this._cmd.writeToTerminal(
        this._renderer,
        'Update completed! Project is Evergreen 🌲 Be sure to run your tests and build for prod!'
      )
      return true
    } catch (error) {
      this._cmd.writeToTerminal(this._renderer, this._cmd.sanitizeStdOut(error.message))
      // check if user wants to force
      this.forceUpdate(this._renderer, `${updateCMD} ${UpdateArgs.force}`)
      return false
    }
  }

  async undo(renderer: any) {
    const gitCmd = 'git reset --hard'
    try {
      this._cmd.writeToTerminal(renderer, 'Undoing changes...')
      await this._cmd.runScript(gitCmd, this._renderer)
      await this._cmd.runScript(UpdateCommands.npmInstall, this._renderer)
      this._cmd.writeToTerminal(renderer, 'Changes have been rolled back.')
    } catch (error) {
      this._cmd.writeToTerminal(renderer, this._cmd.sanitizeStdOut(error.message))
    }
  }

  forceUpdate(renderer: any, updateCmd: string) {
    this._vscode.window
      .showErrorMessage(
        "Can't update: Do you want to try and force the update?",
        {},
        'Cancel',
        'Cancel and Remove Uncommitted Files',
        'Force (RISKY)'
      )
      .then(async (value: string) => {
        if (value && value.includes('Force')) {
          try {
            this._cmd.writeToTerminal(renderer, 'May the Force be with you!')
            await this._cmd.runScript(updateCmd, this._renderer)
            this._cmd.writeToTerminal(
              renderer,
              '🌲  Force Complete 🌲\r\n You will likely have to manually rollback your version of Typescript.\r\nCheck version here https://github.com/angular/angular/blob/master/package.json (or find branch if on next).'
            )
          } catch (error) {
            this._cmd.writeToTerminal(renderer, this._cmd.sanitizeStdOut(error.message))
          }
        } else if (value && value.includes('Remove')) {
          await this.undo(renderer)
        }
        return
      })
  }
}
