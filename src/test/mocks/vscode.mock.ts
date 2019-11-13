export class VscodeMock {
  workspace = {
    getConfiguration() {
      return {
        get() {
          return 'Daily'
        },
      }
    },
  }
}
