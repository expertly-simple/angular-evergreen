import { TerminalManager } from '../commands/terminal-manager'
import { UpdateCommands } from '../common/enums'
export class AngularUpdater {
  readonly _terminalMgr: TerminalManager
  constructor(terminalManager: TerminalManager) {
    this._terminalMgr = terminalManager
  }

  /* updateCli() {
    this._terminalMgr.writeToTerminal(UpdateCommands.ngCliUpdate)
  }

  updateCore() {
    this._terminalMgr.writeToTerminal(UpdateCommands.ngCoreCmd)
  } */

  async update(cmd: UpdateCommands) {
    await this._terminalMgr.writeToTerminal(cmd)
  }
}
