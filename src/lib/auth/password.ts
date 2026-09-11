import "server-only";

// Password hashing via Web Crypto PBKDF2 (works identically on Cloudflare
// Workers and Node — no native bindings, unlike bcrypt).

const ITERATIONS = 100_000;
const KEY_LENGTH_BITS = 256;

function toHex(buf: ArrayBuffer | Uint8Array) {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

async function deriveBits(password: string, salt: Uint8Array) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_LENGTH_BITS
  );
  return bits;
}

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const bits = await deriveBits(password, salt);
  return { hash: toHex(bits), salt: toHex(salt) };
}

export async function verifyPassword(
  password: string,
  hash: string,
  salt: string
): Promise<boolean> {
  const bits = await deriveBits(password, fromHex(salt));
  const computed = toHex(bits);
  // Constant-time comparison
  if (computed.length !== hash.length) return false;
  let mismatch = 0;
  for (let i = 0; i < computed.length; i++) {
    mismatch |= computed.charCodeAt(i) ^ hash.charCodeAt(i);
  }
  return mismatch === 0;
}

export function generateRandomToken(bytes = 24): string {
  return toHex(crypto.getRandomValues(new Uint8Array(bytes)));
}

/**
 * Hashes a high-entropy random token (e.g. a password-reset token) for
 * storage — SHA-256, not PBKDF2. PBKDF2's deliberate slowness exists to
 * blunt brute-forcing a low-entropy human password; a 24-byte random token
 * already has far more entropy than any password could, so a fast
 * cryptographic hash is the standard, appropriate choice here (same
 * approach Django's PasswordResetTokenGenerator and most frameworks use).
 * We still never store the raw token — only this hash, so a database leak
 * doesn't hand out usable reset links.
 */
export async function hashToken(token: string): Promise<string> {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return toHex(bytes);
}

/**
 * Constant-time string comparison — use for any secret comparison (setup
 * tokens, reset tokens, etc.) instead of `===`, which short-circuits on the
 * first mismatched character and can leak timing information.
 */
export function timingSafeStringEqual(a: string, b: string): boolean {
  const aBytes = new TextEncoder().encode(a);
  const bBytes = new TextEncoder().encode(b);
  // Compare against a fixed-length buffer so the loop length doesn't itself
  // leak the length of `a` relative to `b`.
  const len = Math.max(aBytes.length, bBytes.length, 1);
  let mismatch = aBytes.length === bBytes.length ? 0 : 1;
  for (let i = 0; i < len; i++) {
    mismatch |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return mismatch === 0;
}
