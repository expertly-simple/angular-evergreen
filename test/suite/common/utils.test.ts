import { expect } from 'chai'

import { Util } from '../../../src/common/util'

describe('Util', async () => {
  describe('userCancelled()', () => {
    it('returns true when passed "Cancel"', () => {
      const result = Util.userCancelled('Cancel')

      expect(result).to.equal(true)
    })
    it('returns false when not "Cancel" is passed in', () => {
      const result = Util.userCancelled('aldfjalsfj')

      expect(result).to.equal(false)
    })
  })
})
