const glob = require('glob')

import * as path from 'path'

import * as Mocha from 'mocha'

export function run(
  testsRoot: string,
  cb: (error: any, failures?: number) => void
): void {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
  })
  mocha.useColors(true)

  glob('*/**.test.js', { cwd: testsRoot }, (err: Object | null, files: string[]) => {
    if (err) {
      return cb(err)
    }

    // add tests to mocha
    files.map(f => path.resolve(testsRoot, f)).forEach(path => mocha.addFile(path))

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
