import { CMD } from '../../src/commands/cmd'
import { MockRenderer } from '../helpers/mocks/renderer.mock'
describe('script', async () => {
  var objInTest: CMD
  beforeEach(async () => {
    objInTest = new CMD()
  })

  it('test sanitize', async () => {
    const testStr = '          \r\n      t \r\n e s t'

    const result = objInTest.sanitizeStdOut(testStr)

    expect(result).toBe('t    e s t')
  })

  it('test write to renderer', async () => {
    const renderer = new MockRenderer()
    objInTest.writeToTerminal(renderer, 'Test')
    expect(renderer.write).toHaveBeenCalled()
  })
})
