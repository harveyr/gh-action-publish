# gh-action-publish

**NOT MAINTAINED.**

This is a Github Action to publish your Github Action!

This force-adds and pushes your distribution file(s) to a `releases/<version>`
branch.

It will fail unless it runs from a `versions/<version>` branch.

**Requires [checkout](https://github.com/actions/checkout) v2 or above.**

## Usage

Example step:

```yaml
- uses: harveyr/gh-action-publish@releases/<REPLACE_ME_WITH_VERSION>
  with:
    dirs: dist/
  # Without this if conditional, the step will deliberately error out:
  if: contains(github.ref, 'refs/heads/versions/' )
```
