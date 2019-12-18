import * as util from '../src/util'

test('isVersionRef', async () => {
  expect(util.isVersionRef('refs/heads/versions/v0')).toBe(true)
})
