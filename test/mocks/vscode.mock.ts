export const VscodeMock = {
  workspace: {
    getConfiguration() {
      return {
        get() {
          return 'Daily'
        },
      }
    },
  },
}
