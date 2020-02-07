import { Terminal, window } from 'vscode'

export class TerminalManager {
  private terminal: Terminal

  getTerminal() {
    this.showTerminal()
    return this.terminal
  }

  showTerminal() {
    if (!this.terminal) {
      this.terminal = window.createTerminal('Angular Evergreen 🌲')
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

export const TerminalInstance = new TerminalManager()
