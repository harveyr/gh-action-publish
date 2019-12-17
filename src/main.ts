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

async function configureGit(): Promise<void> {
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
}

async function run(): Promise<void> {
  const githubToken = core.getInput('github_token')
  const forcePush = core.getInput('force') === 'true'
  const addPaths: string[] = core
    .getInput('commit_dirs')
    .split(' ')
    .map(token => {
      return token.trim()
    })
    .filter(token => {
      return Boolean(token)
    })

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

  await configureGit()

  for (const dirPath of addPaths) {
    await kit.execAndCapture('git', ['add', '-f', dirPath])
  }
  if (await areChanges()) {
    await kit.execAndCapture('git', [
      'commit',
      '-m',
      `Auto commit on behalf of ${actor}`,
    ])
  }

  // Build and commit the source files.
  // await kit.execAndCapture('npm', ['ci'])
  // await kit.execAndCapture('npm', ['run', 'build'])
  // await kit.execAndCapture('git', ['add', '-f', 'lib'])
  // if (await areChanges()) {
  //   await kit.execAndCapture('git', ['commit', '-m', `${commitPrefix}: build`])
  // }

  // Install and commit the dist node_modules.
  // await kit.execAndCapture('npm', ['cache', 'verify'])
  // await kit.execAndCapture('npm', ['ci', '--only=production'])
  // await kit.execAndCapture('git', ['add', '-f', 'node_modules'])
  // if (await areChanges()) {
  //   await kit.execAndCapture('git', [
  //     'commit',
  //     '-m',
  //     `${commitPrefix}: node_modules`,
  //   ])
  // }

  if (!githubToken) {
    console.log('No Github token provided. Not pushing.')
  }

  const remote = `https://${actor}:${githubToken}@github.com/${repoOwner}/${repoName}.git`
  const version = ref.split('/').pop()
  const pushArgs = ['push', remote, `HEAD:refs/heads/releases/${version}`]
  if (forcePush) {
    pushArgs.push('--force')
  }
  await kit.execAndCapture('git', pushArgs)
}

run().catch(err => {
  core.setFailed(`${err}`)
})
