import * as execa from 'execa'
import * as getStream from 'get-stream'
import * as vscode from 'vscode'

const CLI_CHK_CMD = 'npm info @angular/cli'
const NG_ALL_CMD = 'ng update --all'
const workspace = vscode.workspace.workspaceFolders![0]

export async function ngUpdate(next: boolean = false): Promise<boolean> {
  let latest = ''
  let vnext = ''

  let updateCMD = next ? NG_ALL_CMD + ' --next' : NG_ALL_CMD
  const render = (<any>vscode.window).createTerminalRenderer('Angular Evergreen 🌲')
  render.terminal.show()
  render.write('\x1b[32m 🌲  Welcome to Angular Evergreen 🌲 \r\n\n')
  try {
    await runScript(render, 'npm install')
    await runScript(render, updateCMD)

    // // get latest cli version
    // const clistdout = await execa.shell(CLI_CHK_CMD, { cwd: workspace.uri.path })
    // latest = getVersionsFromStdout(clistdout.stdout, 'latest')
    // vnext = getVersionsFromStdout(clistdout.stdout, 'next')
    // render.write(
    //   `Available @Angular Cli Version: Latest: ${latest} Next: ${vnext} \r\n\n`
    // )
    // // todo: prompt just cli update here
    // // try updatet
    // render.write('Running Update - Please Wait.')
    // const ngstdout = await execa.shell(updateCMD, { cwd: workspace.uri.path })
    // render.write(ngstdout.stdout.replace(/[\n\r]/g, ' ').replace('   ', ''))
    return true
  } catch (error) {
    let msg = error.message.replace(/[\n\r]/g, ' ').replace('   ', '')
    render.write(msg)
    return false
  }
}

async function runScript(render: any, script: string) {
  render.write(`Executing: ${script}\r\n`)
  const scriptStdout = await execa.shell(script, { cwd: workspace.uri.path })
  render.write(scriptStdout.stdout.replace(/[\n\r]/g, ' ').replace('   ', ''))
  render.write('\r\n')
}
