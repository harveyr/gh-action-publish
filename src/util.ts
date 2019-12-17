import { IN_PREFIX, OUT_PREFIX } from './constants'

export function swapPrefix(ref: string): string {
  return ref.replace(IN_PREFIX, OUT_PREFIX)
}

export function isVersionRef(ref: string): boolean {
  return ref.indexOf(IN_PREFIX) === 0
}
