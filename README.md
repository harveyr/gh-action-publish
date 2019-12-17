# gh-action-publish

This is a Github Action to publish your Github Action!

For the time being, it's experimental and infexible in assuming a particular
workflow. This is somewhat purposeful in that I don't want to encourage adoption
of it while my Github Action wisdom is puny and evolving.

Specifically, this:

- runs `npm build`, force-adds your `lib/` dir to git, and commits
- installs your `node_modules` and force-adds/commits them as well

This is meant to solve the following problems:

- You have your `lib/` and `node_modules/` dirs ignored by git, but you need to
  commit them for releases of Github Actions (currently required).
- You suspect (as I do) that committing these things locally may be breaking
  something when GitHub goes to run your action. (Maybe due to local disk
  encryption. Not sure.)
