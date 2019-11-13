import * as vscode from 'vscode'

import { TreeTask } from '../types/tree-task'

export class HelpMenuTask implements vscode.TreeDataProvider<TreeTask> {
  constructor(private context: vscode.ExtensionContext) {}

  public async getChildren(task?: TreeTask): Promise<TreeTask[]> {
    /* if (task && task.label && task.label.includes('Angular Version')) {
      return this.getVersionTree(currentVersion)
    } */

    const treeTasks: TreeTask[] = [
      new TreeTask(
        'Link',
        'Visit blog.angular.io',
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'ng-evergreen.navigateToBlogIo',
          title: 'Visit blog.angular.io',
        },
        this.context.extensionPath + '/resources/web.svg'
      ),
      new TreeTask(
        'Link',
        'Request Consulting',
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'ng-evergreen.navigateToConsultingForm',
          title: 'Request Consulting',
        },
        this.context.extensionPath + '/resources/web.svg'
      ),
    ]

    return treeTasks
  }

  getTreeItem(task: TreeTask): vscode.TreeItem {
    return task
  }
}
