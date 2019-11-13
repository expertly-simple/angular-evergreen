import { expect } from 'chai'

import { CMD } from '../../../src/commands/cmd'

describe('CMD', () => {
  it('sanitizeStdOut', () => {
    const cmdInTest = new CMD()
    const testStr = '          \r\n      t \r\n e s t'

    const result = cmdInTest.sanitizeStdOut(testStr)

    expect(result).to.equal('t    e s t')
  })
})
