import * as assert from 'assert'

import { Util } from '../../../src/common/util'

suite('Util', async () => {
  suite('userCancelled()', () => {
    test('returns true when passed "Cancel"', () => {
      const result = Util.userCancelled('Cancel')

      assert.equal(result, true)
    })
    test('returns false when not "Cancel" is passed in', () => {
      const isFalse = Util.userCancelled('aldfjalsfj')

      assert.equal(isFalse, false)
    })
  })
})
