const AUTH_INTENT_KEY = "storybook_auth_intent";

export function saveAuthIntent(intent) {
  sessionStorage.setItem(AUTH_INTENT_KEY, JSON.stringify(intent));
}

export function getAuthIntent() {
  const rawIntent = sessionStorage.getItem(AUTH_INTENT_KEY);

  if (!rawIntent) {
    return null;
  }

  try {
    return JSON.parse(rawIntent);
  } catch {
    clearAuthIntent();
    return null;
  }
}

export function clearAuthIntent() {
  sessionStorage.removeItem(AUTH_INTENT_KEY);
}
