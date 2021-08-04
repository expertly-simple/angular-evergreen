import * as vscode from 'vscode'

import { TreeTask } from '../types/treeTask'
import { EvergreenCommand, Icon } from './enums'

export class Util {
  static userCancelled(userInput: string | undefined) {
    return !userInput || userInput === '' || userInput === 'Cancel'
  }
}

export function getIconConfig(context: vscode.ExtensionContext, icon: Icon) {
  if (Icon.none) {
    return undefined
  }

  return {
    light: `${context.extensionPath}/resources/light/${icon}.svg`,
    dark: `${context.extensionPath}/resources/dark/${icon}.svg`,
  }
}

export function getLink(
  context: vscode.ExtensionContext,
  title: string,
  command: EvergreenCommand
) {
  return getScriptTask(context, title, command, Icon.web)
}

export function getScriptTask(
  context: vscode.ExtensionContext,
  title: string,
  command: EvergreenCommand,
  icon: Icon,
  suffix?: string
) {
  return new TreeTask(
    'Link',
    title,
    vscode.TreeItemCollapsibleState.None,
    suffix ? undefined : { command: command.toString(), title },
    getIconConfig(context, icon),
    suffix ? `script-${suffix}` : undefined
  )
}

export function getFolder(
  context: vscode.ExtensionContext,
  title: string,
  icon: 'angular-icon' | 'n' | 'ng-evergreen-logo-red' | 'ng-evergreen-logo' | Icon,
  collapsibleState = vscode.TreeItemCollapsibleState.Expanded
) {
  return new TreeTask(
    'Folder',
    title,
    collapsibleState,
    undefined,
    icon in Icon
      ? getIconConfig(context, icon as Icon)
      : `${context.extensionPath}/resources/${icon}.svg`
  )
}
