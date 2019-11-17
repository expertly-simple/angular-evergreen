import { EventEmitter } from 'events'

import { getUpgradeChannel } from '../helpers/upgrade-channel.helpers'
import { IVersionStatus, PackageManager } from '../updaters/package-manager'
import { CheckFrequency, PackagesToCheck, UpdateCommands, UpgradeChannel } from './enums'
import { WorkspaceManager } from './workspace-manager'

export class VersionManager extends EventEmitter {
  private readonly _packageMgr: PackageManager
  private readonly _workspaceMgr: WorkspaceManager
  private versions: IVersionStatus[]

  constructor(
    private packageMgr: PackageManager,
    private workspaceManager: WorkspaceManager
  ) {
    super()
    this._packageMgr = packageMgr
    this._workspaceMgr = workspaceManager
  }

  get cliVersion(): IVersionStatus {
    return this.versions[1]
  }

  get coreVersion(): IVersionStatus {
    return this.versions[0]
  }

  async checkForUpdates(): Promise<void> {
    const upgradeChannel = getUpgradeChannel()
    const [coreOutdated, cliOutdated] = await Promise.all([
      this._packageMgr.checkForUpdate(PackagesToCheck.core, upgradeChannel),
      this._packageMgr.checkForUpdate(PackagesToCheck.cli, upgradeChannel),
    ])

    this.emit('IsEvergreen', (status: boolean) => {
      status = Boolean(!cliOutdated.needsUpdate || !coreOutdated.needsUpdate)
      return status
    })

    this._workspaceMgr.setLastUpdateCheckDate(new Date())
    this.versions = [coreOutdated, cliOutdated]

    this.emit('VersionCheckComplete', (state: string) => 'complete')
  }
}
