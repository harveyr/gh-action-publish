import { IN_PREFIX } from './constants'

export function isVersionRef(ref: string): boolean {
  return ref.indexOf(IN_PREFIX) === 0
}
