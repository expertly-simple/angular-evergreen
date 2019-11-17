import * as vscode from 'vscode'
import { TreeTask } from '../types/tree-task'

export class UpdateMenuTask implements vscode.TreeDataProvider<TreeTask> {
  constructor(private context: vscode.ExtensionContext) {}

  public async getChildren(task?: TreeTask): Promise<TreeTask[]> {
    if (task && task.label && task.label.includes('Using Angular CLI')) {
      return this.getUpdateTree()
    }

    const treeTasks: TreeTask[] = [
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
