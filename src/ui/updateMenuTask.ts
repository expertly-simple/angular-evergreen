import * as vscode from 'vscode'

import { EvergreenCommand, Icon } from '../common/enums'
import { getFolder, getScriptTask } from '../common/util'
import { TreeTask } from '../types/treeTask'

export class UpdateMenuTask implements vscode.TreeDataProvider<TreeTask> {
  constructor(private context: vscode.ExtensionContext) {}

  public async getChildren(task?: TreeTask): Promise<TreeTask[]> {
    if (task && task.label && task.label.includes('Update with Angular CLI')) {
      return this.getUpdateTree()
    }

    if (task && task.label && task.label.includes('Update npm Packages')) {
      return this.getNpmTree()
    }

    const treeTasks: TreeTask[] = [
      getScriptTask(
        this.context,
        'Configure VS Code for Angular',
        EvergreenCommand.configNgVsCode,
        Icon.settingsPlus,
        'config-ng'
      ),
      getFolder(this.context, 'Update with Angular CLI', 'angular-icon'),
      getFolder(this.context, 'Update npm Packages', 'n'),
      getScriptTask(
        this.context,
        'Run Post-Update Checkup',
        EvergreenCommand.postUpdateCheckup,
        Icon.checklist,
        'post-upd'
      ),
    ]

    return treeTasks
  }

  getTreeItem(task: TreeTask): vscode.TreeItem {
    return task
  }

  private getUpdateTree() {
    return [
      getScriptTask(
        this.context,
        'Update Angular CLI & Core',
        EvergreenCommand.updateNg,
        Icon.tools,
        '1'
      ),
      getScriptTask(
        this.context,
        'Update Angular --all',
        EvergreenCommand.updateNgAll,
        Icon.tools,
        '2'
      ),
      getScriptTask(
        this.context,
        'Update Angular --all --force',
        EvergreenCommand.updateNgAllForce,
        Icon.glasses,
        '3'
      ),
      getScriptTask(
        this.context,
        'Update Angular CLI & Core --next',
        EvergreenCommand.updateNgNext,
        Icon.flask,
        '4'
      ),
      getScriptTask(
        this.context,
        'Update Angular --next --all',
        EvergreenCommand.updateNgNextAll,
        Icon.flask,
        '5'
      ),
      getScriptTask(
        this.context,
        'Update Angular --next --all --force',
        EvergreenCommand.updateNgNextAllForce,
        Icon.flask,
        '6'
      ),
    ]
  }

  private getNpmTree() {
    return [
      getScriptTask(
        this.context,
        'Check npm packages',
        EvergreenCommand.ncu,
        Icon.clipboard,
        'ncu'
      ),
      getScriptTask(
        this.context,
        'Apply npm updates',
        EvergreenCommand.ncuUpgrade,
        Icon.tools,
        'ncu-apply'
      ),
    ]
  }
}
