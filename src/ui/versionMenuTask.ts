import * as vscode from 'vscode'

import { EvergreenCommand, Icon } from '../common/enums'
import { getScriptTask } from '../common/util'
import { IVersionStatus } from '../helpers/packageManager'
import { VersionManager } from '../helpers/versionManager'
import { TreeTask } from '../types/treeTask'

interface ICurrentVersions {
  cliVersion: IVersionStatus
  coreVersion: IVersionStatus
}

export class VersionMenuTask implements vscode.TreeDataProvider<TreeTask> {
  public versions: ICurrentVersions
  constructor(
    private context: vscode.ExtensionContext,
    private readonly versionManager: VersionManager
  ) {
    this.versions = {
      coreVersion: versionManager.coreVersion,
      cliVersion: versionManager.cliVersion,
    }
    this.versionManager.on('VersionCheckComplete', () => {
      this.versions = {
        coreVersion: this.versionManager.coreVersion,
        cliVersion: this.versionManager.cliVersion,
      }

      this.getChildren()
    })
  }

  public async getChildren(task?: TreeTask): Promise<TreeTask[]> {
    if (typeof task?.label === 'string') {
      if (task?.label?.includes('Current CLI')) {
        return this.getVersionTree(this.versions.cliVersion)
      }

      if (task?.label?.includes('Current Core')) {
        return this.getVersionTree(this.versions.coreVersion)
      }
    }

    const currentCliVersion = this.versionManager.cliVersion
      ? this.versionManager.cliVersion.currentVersion
      : this.versions.cliVersion.currentVersion

    const currentCoreVersion = this.versionManager.coreVersion
      ? this.versionManager.coreVersion.currentVersion
      : this.versions.coreVersion.currentVersion

    const treeTasks: TreeTask[] = [
      new TreeTask(
        'Folder',
        `Current CLI: ${currentCliVersion}`,
        vscode.TreeItemCollapsibleState.Expanded,
        undefined,
        this.getRedLogoIfNeedsUpdate(this.versions.cliVersion),
        'evergreen-version'
      ),
      new TreeTask(
        'Folder',
        `Current Core: ${currentCoreVersion}`,
        vscode.TreeItemCollapsibleState.Expanded,
        undefined,
        this.getRedLogoIfNeedsUpdate(this.versions.coreVersion),
        'evergreen-version'
      ),
    ]

    return treeTasks
  }

  private getRedLogoIfNeedsUpdate(currentVersion: IVersionStatus) {
    return currentVersion.needsUpdate
      ? `${this.context.extensionPath}/resources/ng-evergreen-logo-red.svg`
      : `${this.context.extensionPath}/resources/ng-evergreen-logo.svg`
  }

  getTreeItem(task: TreeTask): vscode.TreeItem {
    return task
  }

  private getVersionTree(currentVersion: IVersionStatus) {
    return [
      getScriptTask(
        this.context,
        `Latest: ${currentVersion.latestVersion}`,
        EvergreenCommand.viewUpdates,
        Icon.none,
        'latest'
      ),
      getScriptTask(
        this.context,
        `Next: ${currentVersion.nextVersion}`,
        EvergreenCommand.viewUpdatesNext,
        Icon.flask,
        'next'
      ),
    ]
  }
}
