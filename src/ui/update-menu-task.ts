import * as packageManager from '../updaters/package-manager'
import * as vscode from 'vscode'

import { getUpgradeChannel } from '../helpers/upgrade-channel.helpers'
import { PackagesToCheck } from '../common/enums'
import { read } from 'fs'
import { PackageManager } from '../updaters/package-manager'
import { TreeTask } from '../types/tree-task'

export class UpdateMenuTask implements vscode.TreeDataProvider<TreeTask> {
  constructor(private context: vscode.ExtensionContext) {}

  public async getChildren(task?: TreeTask): Promise<TreeTask[]> {
    if (task && task.label && task.label.includes('Using Angular Cli')) {
      return this.getUpdateTree()
    }

    let treeTasks: TreeTask[] = [
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
        'Using Angular Cli?',
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
        'Update Angluar',
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'ng-evergreen.updateAngular',
          title: 'Update Angular Cli',
        },
        this.context.extensionPath + '/resources/run.svg'
      ),
      new TreeTask(
        'Link',
        'Update Angular -all',
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'ng-evergreen.updateAll',
          title: 'Update Angular Core',
        },
        this.context.extensionPath + '/resources/run.svg'
      ),
    ]
  }
}
