import * as vscode from 'vscode'

export async function isGitClean(): Promise<boolean> {
  const terminal = vscode.window.createTerminal(`Angular Evergreen`)
  terminal.show()
  terminal.sendText('git status')
  let output = ''
  ;(terminal as any).onDidWriteData((data: string) => {
    output += data
  })

  const promise = new Promise<boolean>(resolve => {
    setTimeout(() => {
      if (
        output.includes('Changes') ||
        output.includes('Untracked') ||
        output.includes('ahead') ||
        output.includes('behind')
      ) {
        resolve(false)
      } else {
        resolve(true)
      }
      terminal.dispose()
    }, 1000)
  })
  return promise
}
