import { CMD } from '../commands/cmd'

import { UpdateArgs, UpgradeChannel, UpdateCommands } from '../common/enums'
import { isGitClean } from './git-manager'

export class AngularUpdater {
  readonly _vscode: any
  readonly _workspace: string
  readonly _cmd: CMD

  constructor(vscode: any, cmd: CMD) {
    this._cmd = cmd
    this._vscode = vscode
    this._workspace = vscode.workspace.workspaceFolders![0]
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

    const renderer = (<any>this._vscode.window).createTerminalRenderer(
      'Angular Evergreen 🌲'
    )
    renderer.terminal.show()
    renderer.write('\x1b[32m 🌲  Welcome to Angular Evergreen 🌲 \r\n\n')

    try {
      await this._cmd.runScript(renderer, 'npm install')
      await this._cmd.runScript(renderer, coreCMD)
      await this._cmd.runScript(renderer, 'git commit -a -m "Updated Angular CLI & Core"')
      await this._cmd.runScript(renderer, updateCMD)
      this._cmd.writeToTerminal(
        renderer,
        'Update completed! Project is Evergreen 🌲 Be sure to run your tests and build for prod!'
      )
      return true
    } catch (error) {
      this._cmd.writeToTerminal(renderer, this._cmd.sanitizeStdOut(error.message))
      // check if user wants to force
      this.forceUpdate(renderer, `${updateCMD} ${UpdateArgs.force}`)
      return false
    }
  }

  async undo(renderer: any) {
    const gitCmd = 'git reset --hard'
    try {
      this._cmd.writeToTerminal(renderer, 'Undoing changes...')
      await this._cmd.runScript(renderer, gitCmd)
      await this._cmd.runScript(renderer, 'npm install')
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
            await this._cmd.runScript(renderer, updateCmd)
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
