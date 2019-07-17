import * as vscode from 'vscode'

export class TaskProvider implements vscode.TreeDataProvider<TreeTask> {
  constructor(private context: vscode.ExtensionContext) {}

  public async getChildren(task?: TreeTask): Promise<TreeTask[]> {
    let tasks = await vscode.tasks.fetchTasks().then(function(value) {
      return value
    })

    let treeTasks: TreeTask[] = []

    treeTasks.push(
      new TreeTask(
        '',
        'Check For Angular Updates',
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'ng-evergreen.checkForUpdates',
          title: 'Check for Angular Updates',
        },
        this.context.extensionPath + '/resources/ng-evergreen-logo.svg'
      )
    )
    treeTasks.push(
      new TreeTask(
        '',
        'Visit update.io',
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'ng-evergreen.navigateToUpdateIo',
          title: 'Visit update.io',
        },
        this.context.extensionPath + '/resources/angular-icon.svg'
      )
    )
    return treeTasks
  }

  getTreeItem(task: TreeTask): vscode.TreeItem {
    return task
  }
}

class TreeTask extends vscode.TreeItem {
  type: string

  constructor(
    type: string,
    label: string,
    collapsibleState: vscode.TreeItemCollapsibleState,
    command?: vscode.Command,
    iconPath?:
      | string
      | vscode.Uri
      | { light: string | vscode.Uri; dark: string | vscode.Uri }
      | vscode.ThemeIcon
  ) {
    super(label, collapsibleState)
    this.type = type
    this.command = command
    this.iconPath = iconPath
  }
}
