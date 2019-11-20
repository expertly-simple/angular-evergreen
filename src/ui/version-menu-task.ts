import * as vscode from 'vscode'

import { PackagesToCheck } from '../common/enums'
import { ICurrentVersions, VersionManager } from '../common/version-manager'
import { getUpgradeChannel } from '../helpers/upgrade-channel.helpers'
import { TreeTask } from '../types/tree-task'
import { IVersionStatus } from '../updaters/package-manager'

export class VersionMenuTask implements vscode.TreeDataProvider<TreeTask> {
  readonly _versionManager: VersionManager
  public versions: ICurrentVersions
  constructor(
    private context: vscode.ExtensionContext,
    private versionManager: VersionManager,
    private currentVersions: ICurrentVersions
  ) {
    this._versionManager = versionManager
    this.versions = {
      coreVersion: currentVersions.coreVersion,
      cliVersion: currentVersions.cliVersion,
    }
    this._versionManager.on('VersionCheckComplete', () => {
      this.versions = {
        coreVersion: this._versionManager.coreVersion,
        cliVersion: this._versionManager.cliVersion,
      }
      this.getChildren()
    })
  }

  public async getChildren(task?: TreeTask): Promise<TreeTask[]> {
    if (task && task.label && task.label.includes('Current')) {
      return this.getVersionTree(this.versions.cliVersion)
    }

    const currentCliVersion = this._versionManager.cliVersion
      ? this._versionManager.cliVersion.currentVersion
      : this.versions.cliVersion.currentVersion

    const treeTasks: TreeTask[] = [
      new TreeTask(
        'Folder',
        'Current CLI: ' + currentCliVersion,
        vscode.TreeItemCollapsibleState.Expanded,
        undefined,
        this.context.extensionPath +
          (this.versions.cliVersion.needsUpdate
            ? '/resources/ng-evergreen-logo-red.svg'
            : '/resources/ng-evergreen-logo.svg'),
        'evergreen-version'
      ),
    ]

    return treeTasks
  }

  getTreeItem(task: TreeTask): vscode.TreeItem {
    return task
  }

  private getVersionTree(currentVersion: IVersionStatus) {
    return [
      new TreeTask(
        'Folder',
        'Latest: ' + this.versions.cliVersion.latestVersion,
        vscode.TreeItemCollapsibleState.None
      ),
      new TreeTask(
        'Folder',
        'Next: ' + this.versions.cliVersion.nextVersion,
        vscode.TreeItemCollapsibleState.None
      ),
    ]
  }
}
