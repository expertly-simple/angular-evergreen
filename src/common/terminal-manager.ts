import * as vscode from 'vscode'
import { Terminal } from 'vscode'

export class TerminalManager {
  webPanel: any
  constructor(private context: vscode.ExtensionContext) {
    /* this.terminal = vscode.window.createTerminal({
      write: writeEmitter.event,
      onDidAcceptInput: (data: string) => {
        // do something with typed input
        writeEmitter.fire('echo: ' + data)
      },
    }); */

    this.webPanel = vscode.window.createWebviewPanel(
      'angularEvergreen', // Identifies the type of the webview. Used internally
      'Angular Evergreen Output', // Title of the panel displayed to the user
      vscode.ViewColumn.One,
      {
        enableScripts: true,
      }
    )
  }

  getWebviewContent() {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Angular Evergreen</title>
    </head>
    <body>

        <h1>🌲 Angular Evergreen 🌲</h1>
        </br>
        <p id="output"></p>

        <script>
            const output = document.getElementById('output');
            var concatMessage = ":: Running Updates"

            // Handle the message inside the webview
            window.addEventListener('message', event => {

                 concatMessage += "<br> :: " + event.data.message;
                 output.innerHTML = concatMessage;
            });
        </script>
    </body>
    </html>`
  }

  createTerminal(name: string) {
    this.webPanel.webview.html = this.getWebviewContent()
    this.webPanel.onDidDispose(
      () => {
        this.webPanel = undefined
      },
      undefined,
      this.context.subscriptions
    )
  }

  writeToTerminal(renderer: Terminal, message: string): void {
    //this.terminal.sendText(`\r\n ${message} \r\n`)
    this.webPanel.postMessage({ message: `\r\n ${message} \r\n` })
  }
}
