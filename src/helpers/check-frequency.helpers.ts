import * as vscode from 'vscode'

import { CheckFrequency } from '../common/enums'

export const CHECK_FREQUENCY_KEY = 'ng-evergreen.checkFrequency'

export function getCheckFrequency(): string | undefined {
  return vscode.workspace.getConfiguration().get(CHECK_FREQUENCY_KEY)
}

export function checkFrequencyExists(): boolean {
  return !!getCheckFrequency() && getCheckFrequency() !== ''
}

export async function getCheckFrequencyPreference(): Promise<string | undefined> {
  const checkFrequencyVal = await vscode.window.showInformationMessage(
    'How often would you like to check for updates (this can be changed in settings.json)?',
    {},
    CheckFrequency.OnLoad,
    CheckFrequency.Daily
  )

  if (checkFrequencyVal && checkFrequencyVal !== '') {
    await vscode.workspace
      .getConfiguration()
      .update(CHECK_FREQUENCY_KEY, checkFrequencyVal)
  }

  return checkFrequencyVal
}
