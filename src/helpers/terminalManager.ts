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
  }
}

export const TerminalInstance = new TerminalManager()
