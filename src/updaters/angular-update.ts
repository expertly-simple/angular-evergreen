import { CMD } from '../commands/cmd'
import { UpdateArgs, UpdateCommands, UpgradeChannel } from '../common/enums'

export class AngularUpdate {
  readonly vscode: any
  readonly workspace: string
  readonly cmd: CMD
  readonly renderer: any

  constructor(vscode: any, cmd: CMD) {
    this.cmd = cmd
    this.vscode = vscode
    if (vscode.workspace.workspaceFolders) {
      this.workspace = vscode.workspace.workspaceFolders[0]
    }
    this.renderer = (this.vscode.window as any).createTerminal('Angular Evergreen 🌲')
  }

  async tryAngularUpdate(upgradeChannel: UpgradeChannel) {
    // let gitClean = await isGitClean()
    if (true) {
      await this.ngUpdate(upgradeChannel)
    } else {
      this.vscode.window.showErrorMessage(
        "Can't update: You should ensure git branch is clean & up-to-date."
      )
    }
  }

  async tryUpdateAngularCli() {}

  async ngUpdate(upgradeChannel: UpgradeChannel): Promise<boolean> {
    const cmdArgs = upgradeChannel === UpgradeChannel.Next ? UpdateArgs.next : ''
    const coreCMD = `${UpdateCommands.ngCoreCliUpdate} ${cmdArgs}`
    const updateCMD = `${UpdateCommands.ngAllCmd} ${cmdArgs}`

    this.renderer.terminal.show()
    this.renderer.write('\x1b[32m 🌲  Welcome to Angular Evergreen 🌲 \r\n\n')

    try {
      await this.cmd.runScript(UpdateCommands.npmInstall, this.renderer)
      await this.cmd.runScript(coreCMD, this.renderer)
      await this.cmd.runScript(
        'git commit -a -m "Updated Angular CLI & Core"',
        this.renderer
      )
      await this.cmd.runScript(updateCMD, this.renderer)
      this.cmd.writeToTerminal(
        this.renderer,
        'Update completed! Project is Evergreen 🌲 Be sure to run your tests and build for prod!'
      )
      return true
    } catch (error) {
      this.cmd.writeToTerminal(this.renderer, this.cmd.sanitizeStdOut(error.message))
      // check if user wants to force
      this.forceUpdate(this.renderer, `${updateCMD} ${UpdateArgs.force}`)
      return false
    }
  }

  async undo(renderer: any) {
    const gitCmd = 'git reset --hard'
    try {
      this.cmd.writeToTerminal(renderer, 'Undoing changes...')
      await this.cmd.runScript(gitCmd, this.renderer)
      await this.cmd.runScript(UpdateCommands.npmInstall, this.renderer)
      this.cmd.writeToTerminal(renderer, 'Changes have been rolled back.')
    } catch (error) {
      this.cmd.writeToTerminal(renderer, this.cmd.sanitizeStdOut(error.message))
    }
  }

  forceUpdate(renderer: any, updateCmd: string) {
    this.vscode.window
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
            this.cmd.writeToTerminal(renderer, 'May the Force be with you!')
            await this.cmd.runScript(updateCmd, this.renderer)
            this.cmd.writeToTerminal(
              renderer,
              '🌲 Force Complete 🌲\r\n You will likely have to manually rollback your version of Typescript.\r\nCheck version here https://github.com/angular/angular/blob/master/package.json (or find branch if on next).'
            )
          } catch (error) {
            this.cmd.writeToTerminal(renderer, this.cmd.sanitizeStdOut(error.message))
          }
        } else if (value && value.includes('Remove')) {
          await this.undo(renderer)
        }
        return
      })
  }
}
