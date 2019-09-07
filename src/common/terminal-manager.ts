import * as vscode from 'vscode'
import { Terminal } from 'vscode'
const writeEmitter = new vscode.EventEmitter<string>()

export class TerminalManager {
  readonly terminal: Terminal
  psudoterminal: any
  constructor() {
    this.psudoterminal = {
      write: writeEmitter.event,
      onDidAcceptInput: (data: string) => {
        // do something with typed input
        writeEmitter.fire('echo: ' + data)
      },
    }

    this.terminal = vscode.window.createTerminal('Angular Evergreen 🌲')
    this.terminal.show()
  }

  createTerminal(name: string): Terminal {
    this.psudoterminal.name = name
    return vscode.window.createTerminal(this.psudoterminal)
  }

  writeToTerminal(renderer: Terminal, message: string): void {
    this.terminal.sendText(`\r\n ${message} \r\n`)
  }
}
