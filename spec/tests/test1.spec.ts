import { CMD } from '../../src/commands/cmd'
import { MockRenderer } from '../helpers/mocks/renderer.mock'
import { Util } from '../../src/common/util'
import { WorkspaceManager } from '../../src/common/workspace-manager'
import { CheckFrequencyHelper } from '../../src/helpers/check-frequency.helpers'
import execa = require('execa')

const vscodeMock = {
  workspace: {
    getConfiguration() {
      return {
        get() {
          return 'Daily'
        },
      }
    },
  },
}
describe('script', async () => {
  beforeEach(async () => {})

  it('test sanitize', async () => {
    const cmdInTest = new CMD()
    const testStr = '          \r\n      t \r\n e s t'

    const result = cmdInTest.sanitizeStdOut(testStr)

    expect(result).toBe('t    e s t')
  })

  it('test util user cancelled', async () => {
    //test null
    const result = Util.userCancelled('Cancel')

    expect(result).toBeTruthy()

    const isFalse = Util.userCancelled('aldfjalsfj')

    expect(isFalse).toBeFalsy()
  })

  it('test check frequency befoe update greater than one day', async () => {
    var now = new Date()

    const workspaceMgr = new WorkspaceManager(vscodeMock, {})
    const checkFrequencyHelper = new CheckFrequencyHelper(vscodeMock, workspaceMgr)
    spyOn(vscodeMock.workspace, 'getConfiguration')
    spyOn(workspaceMgr, 'getLastUpdateCheckDate').and.returnValue(
      new Date(now.setDate(now.getDate() - 1))
    )

    const result = checkFrequencyHelper.checkFrequencyBeforeUpdate()

    expect(result).toBeTruthy()
  })

  it('test check frequency before update less than day', async () => {
    var now = new Date()
    const workspaceMgr = new WorkspaceManager(vscodeMock, {})
    const checkFrequencyHelper = new CheckFrequencyHelper(vscodeMock, workspaceMgr)
    spyOn(workspaceMgr, 'getLastUpdateCheckDate').and.returnValue(
      new Date(now.setHours(now.getHours() - 23.99))
    )

    const result = checkFrequencyHelper.checkFrequencyBeforeUpdate()
    console.log(result)
    expect(result).toBeFalsy()
  })
})
