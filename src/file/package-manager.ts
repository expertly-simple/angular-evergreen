import * as vscode from 'vscode'

import fs = require('fs')
import latestVersion = require('latest-version')

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

export interface IVersionStatus {
  needsUpdate: boolean
  currentVersion: string
  newVersion: string
}

export async function checkForUpdate(packageName: string): Promise<IVersionStatus> {
  let currentVersion = await getCurrentVersion(packageName)
  const newVersion = await latestVersion(packageName)
  currentVersion = currentVersion.replace('~', '').replace('^', '')

  return {
    needsUpdate: currentVersion[0] < newVersion[0],
    currentVersion: currentVersion,
    newVersion: newVersion,
  }
}
