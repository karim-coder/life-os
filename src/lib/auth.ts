import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// ─── TOTP (Time-based One-Time Password) ──────────────────────────────────
// RFC 6238 TOTP implementation — generates 6-digit codes from a shared secret

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateTOTPSecret(): string {
  const bytes = crypto.randomBytes(20);
  let secret = "";
  for (let i = 0; i < bytes.length; i++) {
    const val = bytes[i];
    secret += BASE32_CHARS[(val >> 3) & 31];
    secret += BASE32_CHARS[((val << 2) & 28) | ((bytes[i + 1] >> 6) & 3)];
  }
  return secret.slice(0, 32);
}

export function generateTOTPCode(secret: string, timeStep: number = 30): string {
  const key = base32Decode(secret);
  const counter = Math.floor(Date.now() / 1000 / timeStep);
  const buffer = Buffer.alloc(8);
  buffer.writeBigInt64BE(BigInt(counter));

  const hmac = crypto.createHmac("sha1", key);
  hmac.update(buffer);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0xf;
  const code =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  return (code % 1000000).toString().padStart(6, "0");
}

export function verifyTOTP(token: string, secret: string, window: number = 1): boolean {
  // Check current time step plus/minus window
  for (let offset = -window; offset <= window; offset++) {
    const timeStep = 30;
    const counter = Math.floor(Date.now() / 1000 / timeStep) + offset;
    const buffer = Buffer.alloc(8);
    buffer.writeBigInt64BE(BigInt(counter));

    const key = base32Decode(secret);
    const hmac = crypto.createHmac("sha1", key);
    hmac.update(buffer);
    const digest = hmac.digest();

    const idx = digest[digest.length - 1] & 0xf;
    const code =
      ((digest[idx] & 0x7f) << 24) |
      ((digest[idx + 1] & 0xff) << 16) |
      ((digest[idx + 2] & 0xff) << 8) |
      (digest[idx + 3] & 0xff);

    const expected = (code % 1000000).toString().padStart(6, "0");
    if (token === expected) return true;
  }
  return false;
}

function base32Decode(secret: string): Buffer {
  const cleaned = secret.replace(/=+$/, "").toUpperCase();
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;

  for (const char of cleaned) {
    const val = BASE32_CHARS.indexOf(char);
    if (val === -1) continue;
    buffer = (buffer << 5) | val;
    bits += 5;
    if (bits >= 8) {
      bytes.push((buffer >> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

// Generate an otpauth:// URI for QR code
export function generateOTPAuthURL(email: string, secret: string): string {
  const label = encodeURIComponent(`Life OS:${email}`);
  const issuer = encodeURIComponent("Life OS");
  return `otpauth://totp/${label}?secret=${secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
}

// ─── Password hashing ─────────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── Session management (signed cookie) ───────────────────────────────────
const SESSION_SECRET = process.env.SESSION_SECRET || "lifeos-dev-secret-change-in-production";

export interface SessionData {
  userId: string;
  email: string;
  twoFactorVerified: boolean;
  createdAt: number;
  expiresAt: number;
}

export function createSession(userId: string, email: string, twoFactorVerified: boolean): string {
  const data: SessionData = {
    userId,
    email,
    twoFactorVerified,
    createdAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const payload = JSON.stringify(data);
  const signature = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

export function verifySession(token: string): SessionData | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString();
    const lastDot = decoded.lastIndexOf(".");
    if (lastDot === -1) return null;

    const payload = decoded.substring(0, lastDot);
    const signature = decoded.substring(lastDot + 1);

    const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("hex");
    if (signature !== expectedSig) return null;

    const data: SessionData = JSON.parse(payload);
    if (Date.now() > data.expiresAt) return null;

    return data;
  } catch {
    return null;
  }
}

// ─── Helper to get current user from request ──────────────────────────────
export async function getUserFromRequest(req: Request): Promise<SessionData | null> {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/lifeos-session=([^;]+)/);
  if (!match) return null;
  return verifySession(match[1]);
}
