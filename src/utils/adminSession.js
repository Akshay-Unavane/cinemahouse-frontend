const ADMIN_UNLOCK_KEY = "ml_admin_unlock_exp";
const UNLOCK_MS = 30 * 60 * 1000;

export function isAdminUnlocked() {
  try {
    const exp = Number(sessionStorage.getItem(ADMIN_UNLOCK_KEY));
    return Boolean(exp && Date.now() < exp);
  } catch {
    return false;
  }
}

export function setAdminUnlocked(expiresInSeconds = 30 * 60) {
  const ms = (expiresInSeconds || 30 * 60) * 1000;
  sessionStorage.setItem(ADMIN_UNLOCK_KEY, String(Date.now() + ms));
}

export function clearAdminUnlock() {
  sessionStorage.removeItem(ADMIN_UNLOCK_KEY);
}
