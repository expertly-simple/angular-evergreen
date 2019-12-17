import * as vscode from 'vscode'

import { TreeTask } from '../types/tree-task'

export class UpdateMenuTask implements vscode.TreeDataProvider<TreeTask> {
  constructor(private context: vscode.ExtensionContext) {}

  public async getChildren(task?: TreeTask): Promise<TreeTask[]> {
    if (task && task.label && task.label.includes('Update with Angular CLI')) {
      return this.getUpdateTree()
    }

    const treeTasks: TreeTask[] = [
      new TreeTask(
        'Folder',
        'Configure VS Code for Angular',
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'ng-evergreen.configureAngularVsCode',
          title: 'Configure VS Code for Angular',
        },
        this.context.extensionPath + '/resources/settings-plus.svg',
        'configure-angular'
      ),
      new TreeTask(
        'Folder',
        'Update with Angular CLI',
        vscode.TreeItemCollapsibleState.Expanded,
        undefined,
        this.context.extensionPath + '/resources/angular-icon.svg',
        'update-cli'
      ),
      new TreeTask(
        'Folder',
        'Run Post Update Checkup',
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'ng-evergreen.runPostUpdateCheckup',
          title: 'Run post update checkup',
        },
        this.context.extensionPath + '/resources/checklist.svg',
        'post-update'
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
        'Update Angular CLI & Core',
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'ng-evergreen.updateAngular',
          title: 'Update Angular',
        },
        this.context.extensionPath + '/resources/run.svg'
      ),
      new TreeTask(
        'Link',
        'Update Angular --all',
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'ng-evergreen.updateAll',
          title: 'Update Angular All',
        },
        this.context.extensionPath + '/resources/run.svg'
      ),
      new TreeTask(
        'Link',
        'Update Angular --all --force',
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'ng-evergreen.updateAllForce',
          title: 'Force Update Angular All',
        },
        this.context.extensionPath + '/resources/run.svg'
      ),
      new TreeTask(
        'Link',
        'Update Angular CLI & Core --next',
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'ng-evergreen.updateAngularNext',
          title: 'Update Angular Next',
        },
        this.context.extensionPath + '/resources/run.svg'
      ),
      new TreeTask(
        'Link',
        'Update Angular --next --all',
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'ng-evergreen.updateAllNext',
          title: 'Update Angular Next All',
        },
        this.context.extensionPath + '/resources/run.svg'
      ),
      new TreeTask(
        'Link',
        'Update Angular --next --all --force',
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'ng-evergreen.updateAllNextForce',
          title: 'Force Update Angular Next All',
        },
        this.context.extensionPath + '/resources/run.svg'
      ),
    ]
  }
}
