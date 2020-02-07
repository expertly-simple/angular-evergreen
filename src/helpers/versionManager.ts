import { EventEmitter } from 'events'

import { PackagesToCheck } from '../common/enums'
import { getUpgradeChannel } from './channelManager'
import { IVersionStatus, PackageManager, PackageManagerInstance } from './packageManager'

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

  constructor(private readonly packageManager: PackageManager) {
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

    this.emit('IsEvergreen', Boolean(!cliStatus.needsUpdate))

    this.packageManager.workspaceManager.setLastUpdateCheckDate(new Date())
    this.versions.cliVersion = cliStatus
    this.versions.coreVersion = coreStatus

    this.emit('VersionCheckComplete', (state: string) => 'complete')
  }
}

export const VersionManagerInstance = new VersionManager(PackageManagerInstance)
