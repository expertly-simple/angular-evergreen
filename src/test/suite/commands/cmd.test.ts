import * as assert from 'assert'

import { CMD } from '../../../commands/cmd'

suite('CMD', () => {
  test('sanitizeStdOut', () => {
    const cmdInTest = new CMD()
    const testStr = '          \r\n      t \r\n e s t'

    const result = cmdInTest.sanitizeStdOut(testStr)

    assert.equal(result, 't    e s t')
  })
})
