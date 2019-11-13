// test('test check frequency before update greater than one day', async () => {
//   var now = new Date()

//   const workspaceMgr = new WorkspaceManager(VscodeMock, {})
//   const checkFrequencyHelper = new CheckFrequencyHelper(VscodeMock, workspaceMgr)
//   spyOn(VscodeMock.workspace, 'getConfiguration')
//   spyOn(workspaceMgr, 'getLastUpdateCheckDate').and.returnValue(
//     new Date(now.setDate(now.getDate() - 1))
//   )

//   const result = checkFrequencyHelper.checkFrequencyBeforeUpdate()

//   expect(result).toBeTruthy()
// })

// test('test check frequency before update less than day', async () => {
//   var now = new Date()
//   const workspaceMgr = new WorkspaceManager(VscodeMock, {})
//   const checkFrequencyHelper = new CheckFrequencyHelper(VscodeMock, workspaceMgr)
//   spyOn(workspaceMgr, 'getLastUpdateCheckDate').and.returnValue(
//     new Date(now.setHours(now.getHours() - 23.99))
//   )

//   const result = checkFrequencyHelper.checkFrequencyBeforeUpdate()
//   console.log(result)
//   expect(result).toBeFalsy()
// })
