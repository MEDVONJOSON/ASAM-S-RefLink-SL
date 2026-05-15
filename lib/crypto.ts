import { randomBytes, scryptSync, timingSafeEqual } from "crypto"

const KEY_LENGTH = 64

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, KEY_LENGTH).toString("hex")
  return `scrypt:${salt}:${hash}`
}

export function verifyPassword(password: string, hash: string): boolean {
  const [scheme, salt, storedHash] = hash.split(":")
  if (scheme !== "scrypt" || !salt || !storedHash) return false

  const candidate = scryptSync(password, salt, KEY_LENGTH)
  const stored = Buffer.from(storedHash, "hex")
  if (stored.length !== candidate.length) return false
  return timingSafeEqual(stored, candidate)
}
