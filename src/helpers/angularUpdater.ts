import { UpdateArgs, UpdateCommands, UpgradeChannel } from '../common/enums'
import { echoToTerminal, runScript, sanitizeStdOut } from './scriptRunner'

export class AngularUpdate {
  readonly vscode: any
  readonly workspace: string
  readonly renderer: any

  constructor(vscode: any) {
    this.vscode = vscode
    if (vscode.workspace.workspaceFolders) {
      this.workspace = vscode.workspace.workspaceFolders[0]
    }
    this.renderer = (this.vscode.window as any).createTerminal('Angular Evergreen 🌲')
  }

  async tryAngularUpdate(upgradeChannel: UpgradeChannel) {
    await this.ngUpdate(upgradeChannel)
  }

  async tryUpdateAngularCli() {}

  async ngUpdate(upgradeChannel: UpgradeChannel): Promise<boolean> {
    const cmdArgs = upgradeChannel === UpgradeChannel.Next ? UpdateArgs.next : ''
    const coreCMD = `${UpdateCommands.ngCoreCliUpdate} ${cmdArgs}`
    const updateCMD = `${UpdateCommands.ngAllCmd} ${cmdArgs}`

    this.renderer.terminal.show()
    this.renderer.write('\x1b[32m 🌲 Welcome to Angular Evergreen 🌲 \r\n\n')

    try {
      await runScript(UpdateCommands.npmInstall, this.renderer)
      await runScript(coreCMD, this.renderer)
      await runScript('git commit -a -m "Updated Angular CLI & Core"', this.renderer)
      await runScript(updateCMD, this.renderer)
      echoToTerminal(this.renderer, 'Update completed! Project is Evergreen 🌲')
      return true
    } catch (error) {
      echoToTerminal(this.renderer, sanitizeStdOut(error.message))
      // check if user wants to force
      this.forceUpdate(this.renderer, `${updateCMD} ${UpdateArgs.force}`)
      return false
    }
  }

  async undo(renderer: any) {
    const gitCmd = 'git reset --hard'
    try {
      echoToTerminal(renderer, 'Undoing changes...')
      await runScript(gitCmd, this.renderer)
      await runScript(UpdateCommands.npmInstall, this.renderer)
      echoToTerminal(renderer, 'Changes have been rolled back.')
    } catch (error) {
      echoToTerminal(renderer, sanitizeStdOut(error.message))
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
            echoToTerminal(renderer, 'May the Force be with you!')
            await runScript(updateCmd, this.renderer)
            echoToTerminal(
              renderer,
              '🌲 Force Complete 🌲\r\n You will likely have to manually rollback your version of Typescript.\r\nCheck version here https://github.com/angular/angular/blob/master/package.json (or find branch if on next).'
            )
          } catch (error) {
            echoToTerminal(renderer, sanitizeStdOut(error.message))
          }
        } else if (value && value.includes('Remove')) {
          await this.undo(renderer)
        }
        return
      })
  }
}
