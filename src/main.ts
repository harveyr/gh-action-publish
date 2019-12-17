import * as core from '@actions/core'

const BRANCH_PREFIX = 'refs/heads/versions/'

async function run(): Promise<void> {
  const branch = core.getInput('branch')
  if (branch.indexOf(BRANCH_PREFIX) !== 0) {
    throw new Error(`Branch must begin with "${BRANCH_PREFIX}". Got "${branch}".`)
  }

  const releaseBranch = branch.replace(BRANCH_PREFIX, 'releases/')

  console.log(`Release branch will be: ${releaseBranch}`)
}

run().catch(err => {
  core.setFailed(`${err}`)
})
