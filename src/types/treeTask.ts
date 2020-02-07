import * as vscode from 'vscode'

export class TreeTask extends vscode.TreeItem {
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
