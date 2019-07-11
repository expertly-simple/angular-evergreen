import * as execa from 'execa'
import * as vscode from 'vscode'

import fs = require('fs')

const getLatestVersion = require('get-latest-version')
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

async function getNextVersion(packageName: string) {
  const script = `npm info ${packageName}`
  const scriptStdout = await execa.shell(script, { cwd: workspace.uri.path })
  return getVersionFromStdout(scriptStdout.stdout, 'next')
}

export interface IVersionStatus {
  needsUpdate: boolean
  currentVersion: string
  latestVersion: string
  nextVersion: string
}

export async function checkForUpdate(packageName: string): Promise<IVersionStatus> {
  let currentVersion = await getCurrentVersion(packageName)
  const latestVersion = await getLatestVersion(packageName)
  const nextVersion = await getNextVersion(packageName)
  currentVersion = currentVersion.replace('~', '').replace('^', '')

  return {
    needsUpdate:
      currentVersion[0] < latestVersion[0] || currentVersion[0] < nextVersion[0],
    currentVersion: currentVersion,
    latestVersion: latestVersion,
    nextVersion: nextVersion,
  }
}

function getVersionFromStdout(stdout: string, versionType: string) {
  const length = 25
  const sIndex = stdout.indexOf(versionType)
  const roughStr = stdout.substr(sIndex, length)
  const colStr = roughStr.substr(roughStr.indexOf(':') + 1, 6)

  return colStr.trim()
}
