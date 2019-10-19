import * as execa from 'execa'

import { Terminal } from 'vscode'

export class CMD {
  constructor() {}

  async runScript(script: string, renderer: Terminal, cwd?: string) {
    this.writeToTerminal(renderer, `Executing: ${script}`)
    const scriptStdout = await execa.command(script, {
      cwd: cwd,
      windowsVerbatimArguments: true,
    })
    return scriptStdout.stdout
  }

  writeToTerminal(renderer: Terminal, message: string): void {
    renderer.sendText(`\r\n ${message} \r\n`)
  }

  sanitizeStdOut(text: any): string {
    return text.replace(/[\n\r]/g, ' ').replace(/\s+/, '')
  }
}
