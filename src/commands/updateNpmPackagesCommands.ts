import { window } from 'vscode'

import { COMMIT_BEFORE_RUNNING, isGitClean } from '../helpers/gitManager'
import { TerminalInstance } from '../helpers/terminalManager'

export function checkNpmUpdates() {
  window.showInformationMessage(
    'See the terminal for packages that needs to be updated. Run 🌲 Quick Command > Apply npm Updates to upgrade.'
  )
  const terminal = TerminalInstance.getTerminal()
  terminal.sendText(`npx npm-check-updates`)
}

export async function applyNpmUpdates() {
  const isClean = await isGitClean()

  if (isClean) {
    window.showInformationMessage(
      'See the terminal for any errors and test your app for regression errors 🕵️'
    )
    const terminal = TerminalInstance.getTerminal()
    terminal.sendText(`npx npm-check-updates -u`)
    terminal.sendText(`npm install`)
  } else {
    window.showErrorMessage(COMMIT_BEFORE_RUNNING)
  }
}
