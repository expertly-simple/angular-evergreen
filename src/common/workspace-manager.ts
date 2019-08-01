const CHECK_FREQUENCY_KEY: string = 'ng-evergreen.checkFrequency'
export class WorkspaceManager {
  readonly _vscode: any
  constructor(vscode: any) {
    this._vscode = vscode
  }

  get updateFrequency(): string {
    return this._vscode.workspace.getConfiguration().get(CHECK_FREQUENCY_KEY)
  }

  getWorkspace() {
    if (this._vscode.workspace) {
      const folders = this._vscode.workspace.workspaceFolders
      return folders && folders.length > 0 ? folders[0] : null
    }

    return null
  }
}
