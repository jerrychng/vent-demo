export const PHONE_POLICY = {
  minDigits: 8,
  maxDigits: 15,
} as const;

const allowedPhoneChars = /^[\d+\-()\s]+$/;

export function getPhoneValidationError(phone: string): string | null {
  if (!phone) return "Phone number is required.";

  const trimmed = phone.trim();
  if (!trimmed) return "Phone number is required.";

  if (!allowedPhoneChars.test(trimmed)) {
    return "Phone number can only include digits, spaces, +, -, and parentheses.";
  }

  const digitsOnly = trimmed.replace(/\D/g, "");
  if (digitsOnly.length < PHONE_POLICY.minDigits || digitsOnly.length > PHONE_POLICY.maxDigits) {
    return `Phone number must contain ${PHONE_POLICY.minDigits}-${PHONE_POLICY.maxDigits} digits.`;
  }

  return null;
}
