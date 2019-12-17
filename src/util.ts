import { IN_PREFIX, OUT_PREFIX } from './constants'

export function swapPrefix(ref: string): string {
  return ref.replace(IN_PREFIX, OUT_PREFIX)
}
