import * as core from '@actions/core'
import * as kit from '@harveyr/github-actions-kit'

const BRANCH_PREFIX = 'refs/heads/versions/'

async function run(): Promise<void> {
  const contextRaw = core.getInput('github_context')
  if (contextRaw) {
    throw new Error('github_context not provided')
  }

  const context = JSON.parse(contextRaw)
  console.log('FIXME:', context.ref)

  const githubUsername = core.getInput('github_usernamez')
  const githubToken = core.getInput('github_token')

  const branch = core.getInput('branch')
  if (branch.indexOf(BRANCH_PREFIX) !== 0) {
    throw new Error(
      `Branch must begin with "${BRANCH_PREFIX}". Got "${branch}".`,
    )
  }

  // const releaseBranch = branch.replace(BRANCH_PREFIX, 'releases/')

  // await kit.execAndCapture('git', ['checkout', '-b', releaseBranch])
  await kit.execAndCapture('git', [
    'config',
    '--local',
    'user.email',
    'action@github.com',
  ])
  await kit.execAndCapture('git', [
    'config',
    '--local',
    'user.name',
    'Github Action',
  ])
  await kit.execAndCapture('npm', ['ci'])
  await kit.execAndCapture('npm', ['run', 'build'])
  await kit.execAndCapture('git', ['add', '-f', 'lib'])
  let changedOutput = await kit.execAndCapture('git', ['status', '-s'])
  if ((changedOutput.stderr + changedOutput.stdout).length) {
    await kit.execAndCapture('git', ['commit', '-m', 'Auto commit: build'])
  }

  await kit.execAndCapture('npm', ['ci', '--only=production'])
  await kit.execAndCapture('git', ['add', '-f', 'node_modules'])
  changedOutput = await kit.execAndCapture('git', ['status', '-s'])
  if ((changedOutput.stderr + changedOutput.stdout).length) {
    await kit.execAndCapture('git', [
      'commit',
      '-m',
      'Auto commit: node_modules',
    ])
  }

  if (!githubUsername) {
    console.log('No Github username provided. Not pushing.')
  }
  if (!githubToken) {
    console.log('No Github token provided. Not pushing.')
  }

  // const remote = `https://${githubUsername}:${githubToken}@github.com/${REPOSITORY}.git`
  // await kit.execAndCapture('git', ['push', remote, `HEAD:${releaseBranch}`])
}

run().catch(err => {
  core.setFailed(`${err}`)
})
