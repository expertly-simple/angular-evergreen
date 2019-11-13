import { read } from 'fs'

import { CheckFrequency } from '../common/enums'
import { WorkspaceManager } from '../common/workspace-manager'

export const CHECK_FREQUENCY_KEY = 'ng-evergreen.checkFrequency'

export class CheckFrequencyHelper {
  readonly _updateFrequncey?: string
  constructor(private _vscode: any, private _workspaceManager: WorkspaceManager) {
    this._updateFrequncey = this._workspaceManager.getUpdateFrequency()
  }

  checkFrequencyExists(): boolean {
    return !!this._updateFrequncey && this._updateFrequncey !== ''
  }

  checkFrequencyBeforeUpdate(): boolean {
    const d = new Date()

    if (!this._workspaceManager.getLastUpdateCheckDate()) {
      return false
    }
    return (
      this._workspaceManager.getLastUpdateCheckDate() <
      new Date(d.setDate(d.getDate() - 1))
    )
  }

  async getCheckFrequencyPreference(): Promise<string | undefined> {
    const checkFrequencyVal = await this._vscode.window.showInformationMessage(
      'How often would you like to check for updates (this can be changed in settings.json)?',
      {},
      CheckFrequency.OnLoad,
      CheckFrequency.Daily
    )

    if (checkFrequencyVal && checkFrequencyVal !== '') {
      await this._vscode.workspace
        .getConfiguration()
        .update(CHECK_FREQUENCY_KEY, checkFrequencyVal)
    }

    return checkFrequencyVal
  }
}
