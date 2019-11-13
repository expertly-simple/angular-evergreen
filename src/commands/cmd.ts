import * as execa from 'execa'

export class CMD {
  constructor() {}

  async runScript(script: string, renderer?: any, cwd?: string) {
    this.writeToTerminal(renderer, `Executing: ${script}`)
    const scriptStdout = await execa.command(script, {
      cwd,
      windowsVerbatimArguments: true,
    })
    return scriptStdout.stdout
  }

  writeToTerminal(renderer: any, message: string): void {
    renderer.write(`\r\n ${message} \r\n`)
  }

  sanitizeStdOut(text: any): string {
    return text.replace(/[\n\r]/g, ' ').replace(/\s+/, '')
  }
}
