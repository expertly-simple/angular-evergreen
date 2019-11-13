import { read } from 'fs'

import { Terminal } from 'vscode'

export class TerminalManager {
  readonly _vscode: any
  readonly _terminal: Terminal
  constructor(vscode: any) {
    this._vscode = vscode
    this._terminal = vscode.window.createTerminal()
    this._terminal.show()
  }

  writeToTerminal(message: string) {
    if (this._terminal) {
      this._terminal.sendText(message)

      let output = ''
      const datawatcher = (this._terminal as any).onDidWriteData((data: string) => {
        output += data
      })

      const promise = new Promise<Boolean>(function(resolve) {
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
}
