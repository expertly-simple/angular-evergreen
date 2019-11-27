import { EventEmitter } from 'events'

import { getUpgradeChannel } from '../helpers/upgrade-channel.helpers'
import { IVersionStatus, PackageManager } from '../updaters/package-manager'
import { PackagesToCheck } from './enums'
import { WorkspaceManager } from './workspace-manager'

export interface ICurrentVersions {
  cliVersion: IVersionStatus
  coreVersion: IVersionStatus
}

export class CurrentVersions implements ICurrentVersions {
  public cliVersion: IVersionStatus
  public coreVersion: IVersionStatus
  constructor() {}
}

export class VersionManager extends EventEmitter {
  private versions: ICurrentVersions = new CurrentVersions()

  constructor(
    private readonly packageManager: PackageManager,
    private readonly workspaceManager: WorkspaceManager
  ) {
    super()
  }

  get cliVersion(): IVersionStatus {
    return this.versions.cliVersion
  }

  get coreVersion(): IVersionStatus {
    return this.versions.coreVersion
  }

  async checkForUpdates(): Promise<void> {
    const upgradeChannel = getUpgradeChannel()
    const [coreStatus, cliStatus] = await Promise.all([
      this.packageManager.checkForUpdate(PackagesToCheck.core, upgradeChannel),
      this.packageManager.checkForUpdate(PackagesToCheck.cli, upgradeChannel),
    ])

    this.emit('IsEvergreen', Boolean(!cliStatus.needsUpdate || !coreStatus.needsUpdate))

    this.workspaceManager.setLastUpdateCheckDate(new Date())
    this.versions.cliVersion = cliStatus
    this.versions.coreVersion = coreStatus

    this.emit('VersionCheckComplete', (state: string) => 'complete')
  }
}
