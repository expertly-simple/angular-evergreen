import { Terminal } from 'vscode'

export class TerminalManager {
  readonly vscode: any
  terminal: Terminal
  constructor(vscode: any) {
    this.vscode = vscode
  }

  showTerminal() {
    if (!this.terminal) {
      this.terminal = this.vscode.window.createTerminal()
    }
    this.terminal.show()
  }

  writeToTerminal(message: string) {
    this.showTerminal()
    this.terminal.sendText(message)

    let output = ''
    ;(this.terminal as any).onDidWriteData((data: string) => {
      output += data
    })

    const promise = new Promise<boolean>(resolve => {
      setTimeout(() => {
        if (
          output.includes('error') ||
          output.includes('Error') ||
          output.includes('fail') ||
          output.includes('Failed')
        ) {
          resolve(false)
        } else {
          resolve(true)
        }
      }, 1000)
    })
    return promise
  }
}
