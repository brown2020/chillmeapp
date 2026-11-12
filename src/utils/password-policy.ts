export const ACCOUNT_PASSWORD_REQUIREMENTS =
  "Use at least 8 characters with uppercase, lowercase, a number, and a special character (any symbol or space)";

/**
 * Account password rule: at least 8 characters with one lowercase letter, one
 * uppercase letter, one digit, and one special character. Any character that
 * is not an ASCII letter or digit counts as special, and any printable
 * character is allowed; only control characters (newlines, tabs, etc.) are
 * rejected. The `u` flag makes the length count Unicode code points.
 */
export const ACCOUNT_PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d])[^\p{Cc}]{8,}$/u;

export const isValidAccountPassword = (password: string): boolean =>
  ACCOUNT_PASSWORD_PATTERN.test(password);
