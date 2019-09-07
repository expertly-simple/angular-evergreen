import * as execa from 'execa'
import { TerminalManager } from '../common/terminal-manager'

export class CMD {
  readonly _terminalManager: TerminalManager
  constructor(terminalManager: TerminalManager) {
    this._terminalManager = terminalManager
  }

  async runScript(script: string, terminal?: any, cwd?: string) {
    this._terminalManager.writeToTerminal(terminal, `Executing: ${script}`)
    const scriptStdout = await execa.command(script, {
      cwd: cwd,
      windowsVerbatimArguments: true,
    })
    return scriptStdout.stdout
  }

  sanitizeStdOut(text: any): string {
    return text.replace(/[\n\r]/g, ' ').replace(/\s+/, '')
  }
}
