import { expect } from 'chai'

import { sanitizeStdOut } from '../../../src/helpers/scriptRunner'

describe('CMD', () => {
  it('sanitizeStdOut', () => {
    const testStr = '          \r\n      t \r\n e s t'

    const result = sanitizeStdOut(testStr)

    expect(result).to.equal('t    e s t')
  })
})
