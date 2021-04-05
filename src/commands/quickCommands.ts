import { window } from 'vscode'

import { COMMIT_BEFORE_RUNNING, isGitClean } from '../helpers/gitManager'
import { TerminalInstance } from '../helpers/terminalManager'
import { VersionManagerInstance } from '../helpers/versionManager'

export async function runEvergreen(): Promise<void> {
  await VersionManagerInstance.checkForUpdates()
}

export function runPostUpdateCheckup() {
  window.showInformationMessage(
    "Running post-update checkup... See the terminal for any errors! If you don't see any, then 🥳🎉"
  )
  const terminal = TerminalInstance.getTerminal()
  terminal.sendText(`npm i -g rimraf`)
  terminal.sendText(`rimraf node_modules`)
  terminal.sendText(`npm install`)
  terminal.sendText(`ng test --watch=false`)
  terminal.sendText(`ng build --prod`)
}

export async function configureAngularVsCode() {
  const isClean = await isGitClean()

  if (isClean) {
    const terminal = TerminalInstance.getTerminal()
    window.showInformationMessage(
      'Applying common Angular settings for VS Code... Review changes before committing your code.'
    )
    terminal.sendText(`npm i -g mrm-task-angular-vscode`)
    terminal.sendText(`npx mrm angular-vscode`)
  } else {
    window.showErrorMessage(COMMIT_BEFORE_RUNNING)
  }
}
