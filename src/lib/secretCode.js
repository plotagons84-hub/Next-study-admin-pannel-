// A second, separate code required to actually save any URL change - on top
// of being logged in as an admin. Only a SHA-256 hash of the code is ever
// shipped in this file; the plaintext code itself is never present in the
// code or the built bundle, so reading the source (or the deployed JS)
// doesn't reveal it directly.
//
// IMPORTANT HONESTY NOTE (read this before relying on it): this still runs
// entirely in the browser. A hash only stops someone from reading the code
// off directly - it does NOT stop a technically determined person from
// brute-forcing or dictionary-attacking the hash, since they can copy it out
// of the JS bundle and try candidate codes offline, as many times as they
// want, with no rate limit. For a code like this (long, mixed case, with
// digits) that's a real deterrent, not a formality - but it is not the same
// guarantee as a real server-side check. True secrecy for something this
// sensitive needs a backend that verifies the code server-side and never
// ships it to the browser at all.
const SECRET_CODE_HASH = 'ebb8cd5f1667038c1a0abacc2ffee5861e6f242aa6620eab52fa021136ec15e5'

async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifySecretCode(input) {
  if (!input) return false
  const hash = await sha256Hex(input.trim())
  return hash === SECRET_CODE_HASH
}
