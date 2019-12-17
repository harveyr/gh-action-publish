import * as util from '../src/util'

test('swap prefix', async () => {
  expect(util.swapPrefix('refs/heads/versions/v0')).toBe(
    'refs/heads/releases/v0',
  )
})
