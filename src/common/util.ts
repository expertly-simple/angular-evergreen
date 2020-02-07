import * as vscode from 'vscode'

import { TreeTask } from '../types/treeTask'
import { EvergreenCommand, Icon } from './enums'

export class Util {
  static userCancelled(userInput: string | undefined) {
    return !userInput || userInput === '' || userInput === 'Cancel'
  }
}

export function getIconConfig(context: vscode.ExtensionContext, icon: Icon) {
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
  return getScriptTask(context, title, command, Icon.web, false)
}

export function getScriptTask(
  context: vscode.ExtensionContext,
  title: string,
  command: EvergreenCommand,
  icon: Icon,
  isScript = true
) {
  return new TreeTask(
    'Link',
    title,
    vscode.TreeItemCollapsibleState.None,
    {
      command: command.toString(),
      title: 'Angular Evergreen',
    },
    getIconConfig(context, icon),
    isScript ? 'script' : undefined
  )
}

export function getFolder(
  context: vscode.ExtensionContext,
  title: string,
  icon: 'angular-icon' | 'n' | 'ng-evergreen-logo-red' | 'ng-evergreen-logo'
) {
  return new TreeTask(
    'Folder',
    title,
    vscode.TreeItemCollapsibleState.Expanded,
    undefined,
    `${context.extensionPath}/resources/${icon}.svg`
  )
}
