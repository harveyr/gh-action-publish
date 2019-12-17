import * as core from '@actions/core'
import * as kit from '@harveyr/github-actions-kit'
import * as github from '@actions/github'
import * as util from './util'

import { IN_PREFIX } from './constants'

async function run(): Promise<void> {
  const githubToken = core.getInput('github_token')
  const context = github.context
  if (!context.payload.repository) {
    throw new Error('No repository found in Github payload. Cannot continue.')
  }

  const repoName = context.payload.repository.name
  const repoOwner = context.payload.repository.owner.login
  console.log('Parsed repo: %s/%s', repoName, repoOwner)

  const { ref, actor } = context
  if (ref.indexOf(IN_PREFIX) !== 0) {
    throw new Error(`Ref must begin with "${IN_PREFIX}". Got "${ref}".`)
  }

  const commitPrefix = `Auto commit on behalf of ${actor}`
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
    await kit.execAndCapture('git', ['commit', '-m', `${commitPrefix}: build`])
  }

  await kit.execAndCapture('npm', ['ci', '--only=production'])
  await kit.execAndCapture('git', ['add', '-f', 'node_modules'])
  changedOutput = await kit.execAndCapture('git', ['status', '-s'])
  if ((changedOutput.stderr + changedOutput.stdout).length) {
    await kit.execAndCapture('git', [
      'commit',
      '-m',
      `${commitPrefix}: node_modules`,
    ])
  }

  const releaseBranch = util.swapPrefix(ref)

  if (!githubToken) {
    console.log('No Github token provided. Not pushing.')
  }

  const remote = `https://${actor}:${githubToken}@github.com/${repoOwner}/${repoName}.git`
  await kit.execAndCapture('git', [
    'push',
    remote,
    `HEAD:refs/heads/${releaseBranch}`,
  ])
}

run().catch(err => {
  core.setFailed(`${err}`)
})
