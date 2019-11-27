const CHECK_FREQUENCY_KEY = 'ng-evergreen.checkFrequency'
const VERSION_TO_SKIP_KEY = 'ng-evergreen.versionToSkip'
const LASTUPDATE_KEY = 'lastUpdate'
export class WorkspaceManager {
  readonly vscode: any
  readonly context: any
  constructor(vscode: any, context: any) {
    this.vscode = vscode
    this.context = context
  }

  getUpdateFrequency(): string | undefined {
    return this.vscode.workspace.getConfiguration().get(CHECK_FREQUENCY_KEY)
  }

  setUpdateFrequency(value: string) {
    this.vscode.workspace.getConfiguration().update(CHECK_FREQUENCY_KEY, value)
  }

  getWorkspace() {
    if (this.vscode.workspace) {
      const folders = this.vscode.workspace.workspaceFolders
      return folders && folders.length > 0 ? folders[0] : null
    }

    return null
  }

  setLastUpdateCheckDate(date: Date) {
    this.context.workspaceState.update(LASTUPDATE_KEY, new Date())
  }

  getLastUpdateCheckDate(): Date {
    return this.context.workspaceState.get(LASTUPDATE_KEY)
  }

  getVersionToSkip(): string | undefined {
    return this.vscode.workspace.getConfiguration().get(VERSION_TO_SKIP_KEY)
  }

  storeVersionToSkip(versionToSkip: string): void {
    this.vscode.workspace.getConfiguration().update(VERSION_TO_SKIP_KEY, versionToSkip)
  }

  clearVersionToSkip(): void {
    this.vscode.workspace.getConfiguration().update(VERSION_TO_SKIP_KEY, undefined)
  }
}
