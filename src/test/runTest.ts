import * as path from 'path'

import { runTests } from 'vscode-test'

// https://github.com/microsoft/vscode-test/blob/bcd614f7a13f3422b530f5f07034d9a7b5f3979c/sample/test/runTest.ts

async function go() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../../../')
    const extensionTestsPath = path.resolve(__dirname, './suite')

    /**
     * Basic usage
     */
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
    })
  } catch (err) {
    console.error('Failed to run tests')
    process.exit(1)
  }
}

go()
