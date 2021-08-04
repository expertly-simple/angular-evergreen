import * as vscode from 'vscode'

import { EvergreenCommand, Icon } from '../common/enums'
import { getFolder, getScriptTask } from '../common/util'
import { TreeTask } from '../types/treeTask'

const updateWithAngularCli = 'Update Angular using ng'
const updateNextWithAngularCli = 'Update to Next Beta or RC'
const updateNpmPackages = 'Update Other npm Packages'

export class UpdateMenuTask implements vscode.TreeDataProvider<TreeTask> {
  constructor(private context: vscode.ExtensionContext) {}

  public async getChildren(task?: TreeTask): Promise<TreeTask[]> {
    if (typeof task?.label === 'string') {
      switch (task.label) {
        case updateWithAngularCli:
          return this.getUpdateTree()
        case updateNextWithAngularCli:
          return this.getUpdateNextTree()
        case updateNpmPackages:
          return this.getNpmTree()
      }
    }

    const treeTasks: TreeTask[] = [
      getScriptTask(
        this.context,
        'Configure VS Code for Angular',
        EvergreenCommand.configNgVsCode,
        Icon.settingsPlus,
        'config-ng'
      ),
      getFolder(this.context, updateWithAngularCli, 'angular-icon'),
      getFolder(
        this.context,
        updateNextWithAngularCli,
        Icon.flask,
        vscode.TreeItemCollapsibleState.Collapsed
      ),
      getFolder(
        this.context,
        updateNpmPackages,
        'n',
        vscode.TreeItemCollapsibleState.Collapsed
      ),
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
        'Update Angular CLI & Core --force',
        EvergreenCommand.updateNgAllForce,
        Icon.glasses,
        '3'
      ),
      getScriptTask(
        this.context,
        'List Other Packages to Update',
        EvergreenCommand.updateNgAll,
        Icon.tools,
        '2'
      ),
    ]
  }

  private getUpdateNextTree() {
    return [
      getScriptTask(
        this.context,
        'Update Angular CLI & Core --next',
        EvergreenCommand.updateNgNext,
        Icon.tools,
        '4'
      ),
      getScriptTask(
        this.context,
        'Update Angular CLI & Core --next --force',
        EvergreenCommand.updateNgNextAllForce,
        Icon.glasses,
        '6'
      ),
      getScriptTask(
        this.context,
        'List Other Packages to Update --next',
        EvergreenCommand.updateNgNextAll,
        Icon.tools,
        '5'
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
