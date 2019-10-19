import * as vscode from 'vscode'

import { API, GitExtension } from '../types/git'

function getGitApi(): API | null {
  const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')
  if (!gitExtension) {
    console.log("Unable to connect to VSCode's GIT SCM Extension.  Is it disabled?")
    return null
  }

  return gitExtension.exports.getAPI(1)
}

export function onCleanGitBranch(): boolean {
  const git = getGitApi()
  if (!git) {
    return false
  }

  const isClean = git.repositories
    .map(repo => repo.state.workingTreeChanges.length === 0)
    .reduce((flag, repoState) => {
      return flag && repoState
    })

  console.log('AngularEvergreen::git-manager::onCleanGitBranch: ', isClean)
  return isClean
}
