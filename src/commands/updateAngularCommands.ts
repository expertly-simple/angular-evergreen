import { window } from 'vscode'

import { UpdateArgs, UpdateCommands } from '../common/enums'
import { PackageManagerInstance } from '../helpers/packageManager'
import { TerminalInstance } from '../helpers/terminalManager'

export async function callUpdateAngular() {
  await TerminalInstance.writeToTerminal(`${PackageManagerInstance.executable} ${UpdateCommands.ngCoreCliUpdate}`)
}

export async function callAngularAll() {
  await TerminalInstance.writeToTerminal(`${PackageManagerInstance.executable} ${UpdateCommands.ngAllCmd}`)
}

export async function callAngularAllForce() {
  await TerminalInstance.writeToTerminal(
    `${PackageManagerInstance.executable} ${UpdateCommands.ngCoreCliUpdate} ${UpdateArgs.force}`
  )
}

export async function callUpdateAngularNext() {
  await TerminalInstance.writeToTerminal(
    `${PackageManagerInstance.executable} ${UpdateCommands.ngCoreCliUpdate} ${UpdateArgs.next}`
  )
}

export async function callAngularAllNext() {
  await TerminalInstance.writeToTerminal(`${PackageManagerInstance.executable} ${UpdateCommands.ngAllCmd} ${UpdateArgs.next}`)
}

export async function callAngularAllNextForce() {
  await TerminalInstance.writeToTerminal(
    `${PackageManagerInstance.executable} ${UpdateCommands.ngCoreCliUpdate} ${UpdateArgs.next} ${UpdateArgs.force}`
  )
}

export async function viewAvailableUpdates() {
  window.showInformationMessage(
    'See the terminal for available updates! Run 🌲 Quick Command > Update Angular to upgrade.'
  )
  await TerminalInstance.writeToTerminal(`${PackageManagerInstance.executable} ${UpdateCommands.ngUpdate}`)
}

export async function viewAvailableUpdatesNext() {
  window.showInformationMessage(
    'See the terminal for available updates! Run 🌲 Quick Command > Update Angular --next to upgrade.'
  )
  await TerminalInstance.writeToTerminal(`${PackageManagerInstance.executable} ${UpdateCommands.ngUpdate} ${UpdateArgs.next}`)
}
