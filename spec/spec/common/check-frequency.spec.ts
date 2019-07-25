import * as vscode from 'vscode'
import * as objInTest from '../../../src/common/check-frequency.helpers'

describe('test check frequency', async () => {
  it('test on load milliseconds', async () => {
    spyOn(vscode.workspace, 'getConfiguration')

    spyOn(objInTest, 'getCheckFrequency').and.returnValue('On Load')

    const result = objInTest.getCheckFrequencyMilliseconds()
    expect(result).toBe(-1)
  })
})
