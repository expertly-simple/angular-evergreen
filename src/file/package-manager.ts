import * as execa from 'execa'
import * as vscode from 'vscode'

import { sanitizeStdOut, writeToTerminal } from '../common/common.helpers'

import { UpgradeChannel } from '../common/enums'

import fs = require('fs')

const workspace = vscode.workspace.workspaceFolders![0]

export const ANG_CLI = '@angular/cli'
export const ANG_CORE = '@angular/core'

export function getWorkspace() {
  if (vscode.workspace) {
    const folders = vscode.workspace.workspaceFolders
    return folders && folders.length > 0 ? folders[0] : null
  }

  return null
}

async function getPackageJsonFile() {
  // Sanity check that a workspace is loaded
  const workspace = getWorkspace()
  if (!workspace) {
    console.error('No workspace found.')
    return null
  }

  // Check that package.json exists
  const packjsonFile = await vscode.workspace.findFiles(
    new vscode.RelativePattern(workspace, 'package.json')
  )
  if (!packjsonFile || packjsonFile.length <= 0) {
    vscode.window.showErrorMessage('File package.json not found')
  }

  // Open and return contents as JSON
  const filedata = fs.readFileSync(packjsonFile[0].fsPath)
  if (!filedata) {
    vscode.window.showErrorMessage('File package.json is empty or corrupt')
  }
  return JSON.parse(filedata.toString())
}

export async function getDevDependencies() {
  const pkgData = await getPackageJsonFile()
  return pkgData.devDependencies
}

export async function getDependencies() {
  const pkgData = await getPackageJsonFile()
  return pkgData.dependencies
}

export async function getCurrentVersion(packageName: string): Promise<string> {
  // Most @angular packages live in dependencies, so check there first.
  const deps = await getDependencies()
  let version = deps[packageName]

  // If not found, check in devDependencies
  if (!version) {
    const devDeps = await getDevDependencies()
    version = devDeps[packageName]
  }

  if (!version) {
    vscode.window.showInformationMessage(`${packageName} could not be found`)
  }

  return version
}

async function getNpmVersion(packageName: string, distTag = '') {
  const script = `npm view ${packageName}${distTag} version`
  let stdout = ''
  try {
    const scriptStdout = await execa.command(script, { cwd: workspace.uri.fsPath })
    stdout = scriptStdout.stdout
  } catch (error) {
    throw new Error(error.message)
  }

  return stdout
}

export interface IVersionStatus {
  needsUpdate: boolean
  currentVersion: string
  latestVersion: string
  nextVersion: string
}

export async function checkForUpdate(
  packageName: string,
  upgradeChannel: UpgradeChannel
): Promise<IVersionStatus> {
  let currentVersion = await getCurrentVersion(packageName)
  const latestVersion = await getNpmVersion(packageName)
  const nextVersion = await getNpmVersion(packageName, '@next')
  currentVersion = currentVersion.replace('~', '').replace('^', '')

  return {
    needsUpdate: doesItNeedUpdating(
      currentVersion,
      latestVersion,
      nextVersion,
      upgradeChannel
    ),
    currentVersion: currentVersion,
    latestVersion: latestVersion,
    nextVersion: nextVersion,
  }
}

function doesItNeedUpdating(
  currentVersion: string,
  latestVersion: string,
  nextVersion: string,
  upgradeChannel: UpgradeChannel
) {
  switch (upgradeChannel) {
    case UpgradeChannel.Latest:
      return currentVersion !== latestVersion
    case UpgradeChannel.Next:
      return currentVersion !== nextVersion
  }
}

function getVersionFromStdout(stdout: string, versionType: string) {
  const length = 25
  const sIndex = stdout.indexOf(versionType)
  const roughStr = stdout.substr(sIndex, length)
  const colStr = roughStr.substr(roughStr.indexOf(':') + 1, 6)

  return colStr.trim()
}
