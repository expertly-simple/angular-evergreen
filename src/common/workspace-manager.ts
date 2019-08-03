const CHECK_FREQUENCY_KEY: string = 'ng-evergreen.checkFrequency'
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
}
