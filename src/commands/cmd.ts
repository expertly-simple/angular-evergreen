import * as execa from 'execa'

import { OutputChannel } from 'vscode'

export class CMD {
  constructor() {}

  async runScript(script: string, renderer: OutputChannel, cwd?: string) {
    this.writeToOutputChannel(renderer, `Executing: ${script}`)
    const scriptStdout = await execa.command(script, {
      cwd: cwd,
      windowsVerbatimArguments: true,
    })
    this.writeToOutputChannel(renderer, scriptStdout.stdout)
    return scriptStdout.stdout
  }

  writeToOutputChannel(renderer: OutputChannel, message: string): void {
    renderer.appendLine('')
    renderer.appendLine(`${message}`)
  }

  sanitizeStdOut(text: any): string {
    return text.replace(/[\n\r]/g, ' ').replace(/\s+/, '')
  }
}
