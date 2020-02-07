import { expect } from 'chai'
import * as sinon from 'sinon'

import { CheckFrequencyHelper } from '../../../src/helpers/frequencyChecker'
import { WorkspaceManager } from '../../../src/helpers/workspaceManager'
import { VscodeMock } from '../../mocks/vscode.mock'

describe('Check frequency', () => {
  it('test check frequency before update greater than one day', async () => {
    const now = new Date()

    const workspaceMgr = new WorkspaceManager(VscodeMock)
    const checkFrequencyHelper = new CheckFrequencyHelper(VscodeMock, workspaceMgr)

    const getConfigurationSpy = sinon.spy(VscodeMock.workspace, 'getConfiguration')
    const yesterdayFake = sinon.fake.returns(new Date(now.setDate(now.getDate() - 1)))
    sinon.replace(workspaceMgr, 'getLastUpdateCheckDate', yesterdayFake)

    const result = checkFrequencyHelper.checkFrequencyBeforeUpdate()

    expect(getConfigurationSpy.calledOnce)
    expect(result).to.equal(true)
  })

  it('test check frequency before update less than day', async () => {
    const now = new Date()
    const workspaceMgr = new WorkspaceManager(VscodeMock)
    const checkFrequencyHelper = new CheckFrequencyHelper(VscodeMock, workspaceMgr)
    const almostYesterdayFake = sinon.fake.returns(
      new Date(now.setHours(now.getHours() - 23.99))
    )
    sinon.replace(workspaceMgr, 'getLastUpdateCheckDate', almostYesterdayFake)

    const result = checkFrequencyHelper.checkFrequencyBeforeUpdate()

    expect(result).to.equal(false)
  })
})
