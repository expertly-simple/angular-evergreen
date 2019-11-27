import * as vscode from 'vscode'

import { VersionManager } from '../common/version-manager'
import { TreeTask } from '../types/tree-task'
import { IVersionStatus } from '../updaters/package-manager'

interface ICurrentVersions {
  cliVersion: IVersionStatus
  coreVersion: IVersionStatus
}

export class VersionMenuTask implements vscode.TreeDataProvider<TreeTask> {
  public versions: ICurrentVersions
  constructor(
    private context: vscode.ExtensionContext,
    private readonly versionManager: VersionManager,
    private currentVersions: ICurrentVersions
  ) {
    this.versions = {
      coreVersion: currentVersions.coreVersion,
      cliVersion: currentVersions.cliVersion,
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
    if (task && task.label && task.label.includes('Current')) {
      return this.getVersionTree(this.versions.cliVersion)
    }

    const currentCliVersion = this.versionManager.cliVersion
      ? this.versionManager.cliVersion.currentVersion
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
