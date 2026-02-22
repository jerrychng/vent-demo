export const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 64,
} as const;

const hasLowercase = /[a-z]/;
const hasUppercase = /[A-Z]/;
const hasDigit = /\d/;
const hasSpecial = /[^A-Za-z0-9]/;
const hasWhitespace = /\s/;

export function getPasswordValidationError(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < PASSWORD_POLICY.minLength) {
    return `Password must be at least ${PASSWORD_POLICY.minLength} characters.`;
  }
  if (password.length > PASSWORD_POLICY.maxLength) {
    return `Password must be at most ${PASSWORD_POLICY.maxLength} characters.`;
  }
  if (hasWhitespace.test(password)) {
    return "Password must not contain spaces.";
  }
  if (!hasLowercase.test(password)) {
    return "Password must include at least one lowercase letter.";
  }
  if (!hasUppercase.test(password)) {
    return "Password must include at least one uppercase letter.";
  }
  if (!hasDigit.test(password)) {
    return "Password must include at least one number.";
  }
  if (!hasSpecial.test(password)) {
    return "Password must include at least one special character.";
  }
  return null;
}
