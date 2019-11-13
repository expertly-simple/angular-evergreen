import { expect } from 'chai'

describe('Extension Tests', () => {
  // Defines a Mocha unit test
  it('Something 1', () => {
    expect(-1).to.equal([1, 2, 3].indexOf(5))
    expect(-1).to.equal([1, 2, 3].indexOf(0))
  })
})
