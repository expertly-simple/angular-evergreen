import execa = require('execa')

import { window } from 'vscode'

import { WorkspaceManagerInstance } from './workspaceManager'

export const COMMIT_BEFORE_RUNNING = 'Commit your changes before running this command.'
const GIT_ERROR = "Couldn't determine Git status. Can't run this command."

export async function isGitClean(): Promise<boolean> {
  const fsPath = WorkspaceManagerInstance.getWorkspace().uri.fsPath

  const promise = new Promise<boolean>(resolve => {
    execa.command('git status', { cwd: fsPath }).then(
      output => {
        resolve(output.stdout.indexOf('clean') > 0)
      },
      rejected => {
        window.showErrorMessage(GIT_ERROR)
        resolve(false)
      }
    )
  })

  return promise
}
