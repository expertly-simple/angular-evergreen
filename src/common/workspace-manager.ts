const CHECK_FREQUENCY_KEY = 'ng-evergreen.checkFrequency'
const VERSION_TO_SKIP_KEY = 'ng-evergreen.versionToSkip'
const LASTUPDATE_KEY = 'lastUpdate'
export class WorkspaceManager {
  readonly _vscode: any
  readonly _context: any
  constructor(vscode: any, context: any) {
    this._vscode = vscode
    this._context = context
  }

  getUpdateFrequency(): string | undefined {
    return this._vscode.workspace.getConfiguration().get(CHECK_FREQUENCY_KEY)
  }

  setUpdateFrequency(value: string) {
    this._vscode.workspace.getConfiguration().update(CHECK_FREQUENCY_KEY, value)
  }

  getWorkspace() {
    if (this._vscode.workspace) {
      const folders = this._vscode.workspace.workspaceFolders
      return folders && folders.length > 0 ? folders[0] : null
    }

    return null
  }

  setLastUpdateCheckDate(date: Date) {
    this._context.workspaceState.update(LASTUPDATE_KEY, new Date())
  }

  getLastUpdateCheckDate(): Date {
    return this._context.workspaceState.get(LASTUPDATE_KEY)
  }

  getVersionToSkip(): string | undefined {
    return this._vscode.workspace.getConfiguration().get(VERSION_TO_SKIP_KEY)
  }

  storeVersionToSkip(versionToSkip: string): void {
    this._vscode.workspace.getConfiguration().update(VERSION_TO_SKIP_KEY, versionToSkip)
  }

  clearVersionToSkip(): void {
    this._vscode.workspace.getConfiguration().update(VERSION_TO_SKIP_KEY, undefined)
  }
}
