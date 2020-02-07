import { expect } from 'chai'

import { Icon } from '../../../src/common/enums'
import { Util, getIconConfig } from '../../../src/common/util'

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

describe('Icon', async () => {
  describe('getIconConfig()', () => {
    it('returns undefined when passed Icon.none', () => {
      const result = getIconConfig(null, Icon.none)

      expect(result).to.be.an('undefined')
    })
  })
})
