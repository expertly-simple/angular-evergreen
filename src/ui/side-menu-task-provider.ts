import * as packageManager from '../file/package-manager'
import * as vscode from 'vscode'

import { getUpgradeChannel } from '../helpers/upgrade-channel.helpers'
import { UpdateCommands } from '../common/enums'
import { read } from 'fs'
import { PackageManager } from '../file/package-manager'

export class SideMenuTaskProvider implements vscode.TreeDataProvider<TreeTask> {
  readonly _packageManager: PackageManager
  constructor(
    private context: vscode.ExtensionContext,
    private packageManager: PackageManager
  ) {
    this._packageManager = packageManager
  }

  public async getChildren(task?: TreeTask): Promise<TreeTask[]> {
    let currentVersion = await this._packageManager.checkForUpdate(
      UpdateCommands.ngAllCmd,
      getUpgradeChannel()
    )

    if (task && task.label && task.label.includes('Angular Version')) {
      return this.getVersionTree(currentVersion)
    }

    let treeTasks: TreeTask[] = [
      new TreeTask(
        'Folder',
        'Current Angular Version: ' + currentVersion.currentVersion,
        vscode.TreeItemCollapsibleState.Collapsed,
        undefined,
        this.context.extensionPath +
          (currentVersion.needsUpdate
            ? '/resources/ng-evergreen-logo-red.svg'
            : '/resources/ng-evergreen-logo.svg'),
        'evergreen-version'
      ),
      new TreeTask(
        'Link',
        'Visit update.angular.io',
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'ng-evergreen.navigateToUpdateIo',
          title: 'Visit update.angular.io',
        },
        this.context.extensionPath + '/resources/angular-icon.svg'
      ),
      new TreeTask(
        'Link',
        'Visit blog.angular.io',
        vscode.TreeItemCollapsibleState.None,
        {
          command: 'ng-evergreen.navigateToBlogIo',
          title: 'Visit blog.angular.io',
        },
        this.context.extensionPath + '/resources/angular-icon.svg'
      ),
    ]

    return treeTasks
  }

  getTreeItem(task: TreeTask): vscode.TreeItem {
    return task
  }

  private getVersionTree(currentVersion: packageManager.IVersionStatus) {
    return [
      new TreeTask(
        'Folder',
        'Latest Version: ' + currentVersion.latestVersion,
        vscode.TreeItemCollapsibleState.None
      ),
      new TreeTask(
        'Folder',
        'Next Version: ' + currentVersion.nextVersion,
        vscode.TreeItemCollapsibleState.None
      ),
    ]
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
      | vscode.ThemeIcon,
    contextValue?: string
  ) {
    super(label, collapsibleState)
    this.type = type
    this.command = command
    this.iconPath = iconPath
    this.contextValue = contextValue
  }

  getChildren() {
    return null
  }
}
