import * as execa from 'execa'
import * as vscode from 'vscode'
import * as fs from 'fs'
import { WorkspaceManager } from '../common/workspace-manager'

import { UpgradeChannel } from '../common/enums'

export interface IVersionStatus {
  needsUpdate: boolean
  currentVersion: string
  latestVersion: string
  nextVersion: string
}

const ANG_CLI = '@angular/cli'
const ANG_CORE = '@angular/core'
export class PackageManager {
  readonly _workspacePath: any
  readonly _workspaceManager: WorkspaceManager
  readonly _workspace: string
  readonly _vscode: any

  constructor(vscode: any) {
    this._workspace = vscode.workspace.workspaceFolders![0]
    this._vscode = vscode
    this._workspaceManager = new WorkspaceManager(this._vscode)
    this._workspacePath = this._workspaceManager.getWorkspace()
  }

  async getPackageJsonFile() {
    // Sanity check that a workspace is loaded
    if (!this._workspacePath) {
      console.error('No workspace found.')
      return null
    }

    // Check that package.json exists
    const packjsonFile = await vscode.workspace.findFiles(
      new vscode.RelativePattern(this._workspacePath, 'package.json')
    )
    if (!packjsonFile || packjsonFile.length <= 0) {
      vscode.window.showErrorMessage('File package.json not found')
    }

    // Open and return contents as JSON
    const filedata = fs.readFileSync(packjsonFile[0].fsPath)
    if (!filedata) {
      vscode.window.showErrorMessage('File package.json is empty or corrupt')
    }
    return JSON.parse(filedata.toString())
  }

  async getDevDependencies() {
    const pkgData = await this.getPackageJsonFile()
    return pkgData.devDependencies
  }

  async getDependencies() {
    const pkgData = await this.getPackageJsonFile()
    return pkgData.dependencies
  }

  async getCurrentVersion(packageName: string): Promise<string> {
    // Most @angular packages live in dependencies, so check there first.
    const deps = await this.getDependencies()
    let version = deps[packageName]

    // If not found, check in devDependencies
    if (!version) {
      const devDeps = await this.getDevDependencies()
      version = devDeps[packageName]
    }

    if (!version) {
      vscode.window.showInformationMessage(`${packageName} could not be found`)
    }

    return version
  }

  async getNpmVersion(packageName: string, distTag = '') {
    const script = `npm view ${packageName}${distTag} version`
    let stdout = ''
    try {
      const scriptStdout = await execa.command(script, {
        cwd: this._workspacePath.uri.fsPath,
      })
      stdout = scriptStdout.stdout
    } catch (error) {
      throw new Error(error.message)
    }

    return stdout
  }
}
