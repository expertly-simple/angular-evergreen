import * as fs from 'fs'

import * as execa from 'execa'
import * as vscode from 'vscode'

import { UpgradeChannel } from '../common/enums'
import { WorkspaceManager } from '../common/workspace-manager'

export interface IVersionStatus {
  needsUpdate: boolean
  currentVersion: string
  latestVersion: string
  nextVersion: string
}

export class PackageManager {
  readonly _workspacePath: any
  readonly _workspaceManager: WorkspaceManager
  readonly _workspace: string
  readonly _vscode: any
  private _pkgDependencies: any
  private _pkgDevDepencies: any

  constructor(vscode: any, workspaceManager: WorkspaceManager) {
    this._workspace = vscode.workspace.workspaceFolders![0]
    this._vscode = vscode
    this._workspaceManager = workspaceManager
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

  private async getDependencies() {
    const pkgData = await this.getPackageJsonFile()
    this._pkgDependencies = pkgData.dependencies
    this._pkgDevDepencies = pkgData.devDependencies
  }

  private async getCurrentVersion(packageName: string) {
    if (!this._pkgDependencies) {
      await this.getDependencies()
    }
    // Most @angular packages live in dependencies, so check there first.
    let version = this._pkgDependencies[packageName]

    // If not found, check in devDependencies
    if (!version) {
      version = this._pkgDevDepencies[packageName]
    }

    if (!version) {
      vscode.window.showInformationMessage(`${packageName} could not be found`)
    }

    return version
  }

  private async getNpmVersion(packageName: string, distTag = '') {
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

  async checkForUpdate(
    packageName: string,
    upgradeChannel: UpgradeChannel
  ): Promise<IVersionStatus> {
    let currentVersion = await this.getCurrentVersion(packageName)
    const latestVersion = await this.getNpmVersion(packageName)
    const nextVersion = await this.getNpmVersion(packageName, '@next')
    currentVersion = currentVersion.replace('~', '').replace('^', '')

    return {
      needsUpdate: this.doesItNeedUpdating(
        currentVersion,
        latestVersion,
        nextVersion,
        upgradeChannel
      ),
      currentVersion,
      latestVersion,
      nextVersion,
    }
  }

  doesItNeedUpdating(
    currentVersion: string,
    latestVersion: string,
    nextVersion: string,
    upgradeChannel: UpgradeChannel
  ) {
    switch (upgradeChannel) {
      case UpgradeChannel.Latest:
        return currentVersion !== latestVersion
      case UpgradeChannel.Next:
        return currentVersion !== nextVersion
    }
  }
}
