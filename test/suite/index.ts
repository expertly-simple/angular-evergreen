const glob = require('glob')

import * as path from 'path'

import * as chai from 'chai'
import * as Mocha from 'mocha'

import sinonChai = require('sinon-chai')
chai.use(sinonChai)

export function run(
  testsRoot: string,
  cb: (error: any, failures?: number) => void
): void {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'bdd',
  })
  mocha.useColors(true)

  glob('*/**.test.js', { cwd: testsRoot }, (err: object | null, files: string[]) => {
    if (err) {
      return cb(err)
    }

    // add tests to mocha
    files
      .map(f => path.resolve(testsRoot, f))
      .forEach(childPath => mocha.addFile(childPath))

    try {
      // Run the mocha test
      mocha.run(failures => {
        cb(null, failures)
      })
    } catch (err) {
      cb(err)
    }
  })
}
