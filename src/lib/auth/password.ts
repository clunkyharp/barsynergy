import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;
const DUMMY_PASSWORD_HASH = '$2b$12$L1bbRmJXX4WwP2jInWyUTe0WB5qHjYzqfATVib4juX3XGJY3fGHa.';

export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export async function verifyPasswordAgainstDummyHash(password: string) {
  return bcrypt.compare(password, DUMMY_PASSWORD_HASH);
}
