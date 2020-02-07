import * as vscode from 'vscode'

import { EvergreenCommand } from '../common/enums'
import { getLink } from '../common/util'
import { TreeTask } from '../types/treeTask'

export class HelpMenuTask implements vscode.TreeDataProvider<TreeTask> {
  constructor(private context: vscode.ExtensionContext) {}

  public async getChildren(task?: TreeTask): Promise<TreeTask[]> {
    const treeTasks: TreeTask[] = [
      getLink(this.context, 'How to Update', EvergreenCommand.navToUpdateIo),
      getLink(this.context, 'Visit blog.angular.io', EvergreenCommand.navToBlogIo),
      getLink(this.context, 'Request Consulting', EvergreenCommand.requestConsulting),
    ]

    return treeTasks
  }

  getTreeItem(task: TreeTask): vscode.TreeItem {
    return task
  }
}
