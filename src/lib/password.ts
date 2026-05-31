import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

const ROUNDS = 12;
const OFFICER_PASSWORD_CHARS =
  "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** One-time login password for new officers (manage in Supabase if reset is needed). */
export function generateOfficerPassword(length = 16): string {
  const bytes = randomBytes(length);
  let value = "";
  for (let i = 0; i < length; i += 1) {
    value += OFFICER_PASSWORD_CHARS[bytes[i] % OFFICER_PASSWORD_CHARS.length];
  }
  return value;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
