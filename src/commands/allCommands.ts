import * as vscode from 'vscode'

import { EvergreenCommand } from '../common/enums'
import { VersionManagerInstance } from '../helpers/versionManager'
import {
  navigateToBlogIo,
  navigateToRequestForm,
  navigateToUpdateIo,
} from './helpCommands'
import {
  configureAngularVsCode,
  runEvergreen,
  runPostUpdateCheckup,
} from './quickCommands'
import {
  callAngularAll,
  callAngularAllForce,
  callAngularAllNext,
  callAngularAllNextForce,
  callUpdateAngular,
  callUpdateAngularNext,
  viewAvailableUpdates,
  viewAvailableUpdatesNext,
} from './updateAngularCommands'
import { applyNpmUpdates, checkNpmUpdates } from './updateNpmPackagesCommands'

export const VsCodeCommands = [
  vscode.commands.registerCommand(
    EvergreenCommand.startEvergreen.toString(),
    runEvergreen
  ),
  vscode.commands.registerCommand(
    EvergreenCommand.checkForUpdates.toString(),
    VersionManagerInstance.checkForUpdates
  ),
  vscode.commands.registerCommand(
    EvergreenCommand.navToUpdateIo.toString(),
    navigateToUpdateIo
  ),
  vscode.commands.registerCommand(
    EvergreenCommand.navToBlogIo.toString(),
    navigateToBlogIo
  ),
  vscode.commands.registerCommand(
    EvergreenCommand.updateNg.toString(),
    callUpdateAngular
  ),
  vscode.commands.registerCommand(
    EvergreenCommand.updateNgAll.toString(),
    callAngularAll
  ),
  vscode.commands.registerCommand(
    EvergreenCommand.updateNgAllForce.toString(),
    callAngularAllForce
  ),
  vscode.commands.registerCommand(
    EvergreenCommand.updateNgNext.toString(),
    callUpdateAngularNext
  ),
  vscode.commands.registerCommand(
    EvergreenCommand.updateNgNextAll.toString(),
    callAngularAllNext
  ),
  vscode.commands.registerCommand(
    EvergreenCommand.updateNgNextAllForce.toString(),
    callAngularAllNextForce
  ),
  vscode.commands.registerCommand(
    EvergreenCommand.viewUpdates.toString(),
    viewAvailableUpdates
  ),
  vscode.commands.registerCommand(
    EvergreenCommand.viewUpdatesNext.toString(),
    viewAvailableUpdatesNext
  ),
  vscode.commands.registerCommand(
    EvergreenCommand.postUpdateCheckup.toString(),
    runPostUpdateCheckup
  ),
  vscode.commands.registerCommand(
    EvergreenCommand.configNgVsCode.toString(),
    configureAngularVsCode
  ),
  vscode.commands.registerCommand(
    EvergreenCommand.requestConsulting.toString(),
    navigateToRequestForm
  ),
  vscode.commands.registerCommand(EvergreenCommand.ncu.toString(), checkNpmUpdates),
  vscode.commands.registerCommand(
    EvergreenCommand.ncuUpgrade.toString(),
    applyNpmUpdates
  ),
]
