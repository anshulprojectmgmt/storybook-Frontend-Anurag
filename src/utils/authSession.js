const TOKEN_KEY = "storybook_token";
const USER_KEY = "storybook_user";

export function getStoredAuthSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);

  if (!token || !rawUser) {
    return {
      token: "",
      user: null,
    };
  }

  try {
    return {
      token,
      user: JSON.parse(rawUser),
    };
  } catch {
    clearStoredAuthSession();
    return {
      token: "",
      user: null,
    };
  }
}

export function saveAuthSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
