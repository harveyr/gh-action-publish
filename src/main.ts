import * as core from '@actions/core'
import * as github from '@actions/github'
import * as kit from '@harveyr/github-actions-kit'
import * as util from './util'

/**
 * Returns true if git sees changes in the workspace.
 *
 * There's probably a more elegant way to do this.
 */
async function areChanges(): Promise<boolean> {
  const changedOutput = await kit.execAndCapture('git', ['status', '-s'])
  return (changedOutput.stderr + changedOutput.stdout).length > 0
}

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
  if (!util.isVersionRef(ref)) {
    throw new Error(`Ref is not an expected pattern: "${ref}"`)
  }

  const commitPrefix = `Auto commit on behalf of ${actor}`
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

  // Build and commit the source files.
  await kit.execAndCapture('npm', ['ci'])
  await kit.execAndCapture('npm', ['run', 'build'])
  await kit.execAndCapture('git', ['add', '-f', 'lib'])
  if (await areChanges()) {
    await kit.execAndCapture('git', ['commit', '-m', `${commitPrefix}: build`])
  }

  // Install and commit the dist node_modules.
  await kit.execAndCapture('npm', ['ci', '--only=production'])
  await kit.execAndCapture('git', ['add', '-f', 'node_modules'])
  if (await areChanges()) {
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
