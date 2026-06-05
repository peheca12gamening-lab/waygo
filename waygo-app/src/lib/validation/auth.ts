export const PASSWORD_RULES = {
  minLength: 8,
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /\d/,
  special: /[^A-Za-z0-9]/,
};

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
}

export function validateUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username.trim());
}

export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  let score = 0;

  if (password.length >= PASSWORD_RULES.minLength) score++;
  if (PASSWORD_RULES.uppercase.test(password)) score++;
  if (PASSWORD_RULES.lowercase.test(password)) score++;
  if (PASSWORD_RULES.number.test(password)) score++;
  if (PASSWORD_RULES.special.test(password)) score++;

  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
}

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_RULES.minLength) {
    return 'Password must be at least 8 characters.';
  }

  if (!PASSWORD_RULES.uppercase.test(password)) {
    return 'Password must contain an uppercase letter.';
  }

  if (!PASSWORD_RULES.lowercase.test(password)) {
    return 'Password must contain a lowercase letter.';
  }

  if (!PASSWORD_RULES.number.test(password)) {
    return 'Password must contain a number.';
  }

  if (!PASSWORD_RULES.special.test(password)) {
    return 'Password must contain a special character.';
  }

  return null;
}
