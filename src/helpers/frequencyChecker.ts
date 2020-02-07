import { CheckFrequency } from '../common/enums'
import { WorkspaceManager } from './workspaceManager'

export const CHECK_FREQUENCY_KEY = 'ng-evergreen.checkFrequency'

export class CheckFrequencyHelper {
  readonly updateFrequncey?: string
  constructor(private vscode: any, private workspaceManager: WorkspaceManager) {
    this.updateFrequncey = this.workspaceManager.getUpdateFrequency()
  }

  checkFrequencyExists(): boolean {
    return !!this.updateFrequncey && this.updateFrequncey !== ''
  }

  checkFrequencyBeforeUpdate(): boolean {
    const d = new Date()

    if (!this.workspaceManager.getLastUpdateCheckDate()) {
      return false
    }
    return (
      this.workspaceManager.getLastUpdateCheckDate() <
      new Date(d.setDate(d.getDate() - 1))
    )
  }

  async getCheckFrequencyPreference(): Promise<string | undefined> {
    const checkFrequencyVal = await this.vscode.window.showInformationMessage(
      'How often would you like to check for updates (this can be changed in settings.json)?',
      {},
      CheckFrequency.OnLoad,
      CheckFrequency.Daily
    )

    if (checkFrequencyVal && checkFrequencyVal !== '') {
      await this.vscode.workspace
        .getConfiguration()
        .update(CHECK_FREQUENCY_KEY, checkFrequencyVal)
    }

    return checkFrequencyVal
  }
}
