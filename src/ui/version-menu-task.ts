import * as packageManager from "../updaters/package-manager";
import * as vscode from "vscode";

import { getUpgradeChannel } from "../helpers/upgrade-channel.helpers";
import { PackagesToCheck } from "../common/enums";
import { read } from "fs";
import { PackageManager } from "../updaters/package-manager";
import { TreeTask } from "../types/tree-task";

export class VersionMenuTask implements vscode.TreeDataProvider<TreeTask> {
  readonly _packageManager: PackageManager;
  constructor(
    private context: vscode.ExtensionContext,
    private packageManager: PackageManager
  ) {
    this._packageManager = packageManager;
  }

  public async getChildren(task?: TreeTask): Promise<TreeTask[]> {
    let currentVersion = await this._packageManager.checkForUpdate(
      PackagesToCheck.cli,
      getUpgradeChannel()
    );

    if (task && task.label && task.label.includes("Current")) {
      return this.getVersionTree(currentVersion);
    }

    let treeTasks: TreeTask[] = [
      new TreeTask(
        "Folder",
        "Current: " + currentVersion.currentVersion,
        vscode.TreeItemCollapsibleState.Expanded,
        undefined,
        this.context.extensionPath +
          (currentVersion.needsUpdate
            ? "/resources/ng-evergreen-logo-red.svg"
            : "/resources/ng-evergreen-logo.svg"),
        "evergreen-version"
      )
    ];

    return treeTasks;
  }

  getTreeItem(task: TreeTask): vscode.TreeItem {
    return task;
  }

  private getVersionTree(currentVersion: packageManager.IVersionStatus) {
    return [
      new TreeTask(
        "Folder",
        "Latest: " + currentVersion.latestVersion,
        vscode.TreeItemCollapsibleState.None
      ),
      new TreeTask(
        "Folder",
        "Next: " + currentVersion.nextVersion,
        vscode.TreeItemCollapsibleState.None
      )
    ];
  }
}
