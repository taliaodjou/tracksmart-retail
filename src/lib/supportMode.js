// Support mode: admin can view a client's dashboard without their password
// Stored in localStorage so it persists across navigation within the session

const KEY = 'tracksmart_support_mode';

export function enterSupportMode(clientUser) {
  localStorage.setItem(KEY, JSON.stringify({
    clientId: clientUser.id,
    clientEmail: clientUser.email,
    clientName: clientUser.shop_name || clientUser.full_name || clientUser.email,
  }));
}

export function exitSupportMode() {
  localStorage.removeItem(KEY);
}

export function getSupportMode() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isInSupportMode() {
  return !!getSupportMode();
}