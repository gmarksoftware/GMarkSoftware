import { createHmac, randomBytes, scrypt as _scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

/* ---------- passwords (scrypt, no external dependency) ---------- */

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = String(stored).split(':');
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/* ---------- signed tokens (standard HS256 JWT) ---------- */

export interface TokenPayload {
  sub: string; // user id
  role: string;
  iat: number;
  exp: number;
}

const b64 = (b: Buffer | string) => Buffer.from(b).toString('base64url');
const sign = (data: string, secret: string) => createHmac('sha256', secret).update(data).digest();

export function signToken(user: { id: string; role: string }, secret: string, ttlSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const header = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64(JSON.stringify({ sub: user.id, role: user.role, iat: now, exp: now + ttlSeconds }));
  return `${header}.${body}.${b64(sign(`${header}.${body}`, secret))}`;
}

/** Returns the payload, or null if the token is malformed, tampered with, or expired. */
export function verifyToken(token: string, secret: string): TokenPayload | null {
  const parts = String(token ?? '').split('.');
  if (parts.length !== 3) return null;
  const [h, p, s] = parts;
  const expected = sign(`${h}.${p}`, secret);
  const given = Buffer.from(s, 'base64url');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const header = JSON.parse(Buffer.from(h, 'base64url').toString());
    if (header.alg !== 'HS256') return null;
    const payload = JSON.parse(Buffer.from(p, 'base64url').toString()) as TokenPayload;
    if (!payload.sub || typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
