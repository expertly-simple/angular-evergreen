import { CMD } from '../../src/commands/cmd'
import { MockRenderer } from '../helpers/mocks/renderer.mock'
import { Util } from '../../src/common/util'
import execa = require('execa')
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
})
