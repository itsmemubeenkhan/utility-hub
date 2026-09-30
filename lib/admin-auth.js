/* Admin auth: cookie holds sha256(password + salt), never the password itself. */
import { createHash } from 'crypto';
import { cookies } from 'next/headers';

const SALT = 'utilityhub-admin-v1';
export const ADMIN_COOKIE = 'uh_admin';

export function adminPassword() {
  return process.env.ADMIN_PASSWORD || 'changeme';
}

export function tokenFor(password) {
  return createHash('sha256').update(String(password) + '|' + SALT).digest('hex');
}

export async function isAdmin() {
  const jar = await cookies();
  const c = jar.get(ADMIN_COOKIE);
  return !!c && c.value === tokenFor(adminPassword());
}
