export const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

/** Supabase Auth needs an email; usernames map to a hidden placeholder address. */
export function usernameToEmail(username: string) {
  return `${username.toLowerCase()}@users.stus.app`;
}
