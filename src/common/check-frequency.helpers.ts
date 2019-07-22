import * as vscode from 'vscode'

import { CheckFrequency, CheckFrequencyMilliseconds } from './enums'

export const CHECK_FREQUENCY_KEY = 'ng-evergreen.checkFrequency'

export function getCheckFrequency(): string | undefined {
  return vscode.workspace.getConfiguration().get(CHECK_FREQUENCY_KEY)
}

export function getCheckFrequencyMilliseconds(): number {
  // get user's selected check frequency
  const checkFrequencyValue = getCheckFrequency()

  // return frequency in milliseconds
  switch (checkFrequencyValue) {
    case CheckFrequency.OnLoad:
      return -1
    case CheckFrequency.Hourly:
      return CheckFrequencyMilliseconds.HourlySchedule
    case CheckFrequency.Daily:
      return CheckFrequencyMilliseconds.DailySchedule
    case CheckFrequency.Weekly:
      return CheckFrequencyMilliseconds.WeeklySchedule
    case CheckFrequency.BiWeekly:
      return CheckFrequencyMilliseconds.BiWeeklySchedule
    default:
      return CheckFrequencyMilliseconds.DailySchedule
  }
}

export function checkFrequencyExists(): boolean {
  return !!getCheckFrequency() && getCheckFrequency() !== ''
}

export async function getCheckFrequencyPreference(): Promise<string | undefined> {
  const checkFrequencyVal = await vscode.window.showInformationMessage(
    'How often would you like to check for updates (this can be changed in settings.json)?',
    {},
    CheckFrequency.OnLoad,
    CheckFrequency.Hourly,
    CheckFrequency.Daily,
    CheckFrequency.Weekly,
    CheckFrequency.BiWeekly
  )

  if (checkFrequencyVal && checkFrequencyVal !== '') {
    await vscode.workspace
      .getConfiguration()
      .update(CHECK_FREQUENCY_KEY, checkFrequencyVal)
  }

  return checkFrequencyVal
}
