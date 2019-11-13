import { read } from 'fs'

import * as vscode from 'vscode'

import { PackagesToCheck } from '../common/enums'
import { getUpgradeChannel } from '../helpers/upgrade-channel.helpers'
import { TreeTask } from '../types/tree-task'
import * as packageManager from '../updaters/package-manager'
import { PackageManager } from '../updaters/package-manager'

export class UpdateMenuTask implements vscode.TreeDataProvider<TreeTask> {
  constructor(private context: vscode.ExtensionContext) {}

  public async getChildren(task?: TreeTask): Promise<TreeTask[]> {
    if (task && task.label && task.label.includes('Using Angular CLI')) {
      return this.getUpdateTree()
    }

    const treeTasks: TreeTask[] = [
      new TreeTask(
        'Link',
        'How to Update',
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'ng-evergreen.navigateToUpdateIo',
          title: 'Visit update.angular.io',
        },
        this.context.extensionPath + '/resources/web.svg'
      ),
      new TreeTask(
        'Folder',
        'Using Angular CLI?',
        vscode.TreeItemCollapsibleState.Expanded,
        undefined,
        this.context.extensionPath + '/resources/angular-icon.svg',
        'update-cli'
      ),
    ]

    return treeTasks
  }

  getTreeItem(task: TreeTask): vscode.TreeItem {
    return task
  }

  private getUpdateTree() {
    return [
      new TreeTask(
        'Link',
        'Update Angular',
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'ng-evergreen.updateAngular',
          title: 'Update Angular',
        },
        this.context.extensionPath + '/resources/run.svg'
      ),
      new TreeTask(
        'Link',
        'Update Angular -all',
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'ng-evergreen.updateAll',
          title: 'Update Angular All',
        },
        this.context.extensionPath + '/resources/run.svg'
      ),
    ]
  }
}
