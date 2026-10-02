import { randomUUID } from 'node:crypto'

/** Cupi's own internal identifier for an order (a UUID string). */
export function systemId(): string {
  return randomUUID()
}
