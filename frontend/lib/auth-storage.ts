const TOKEN_KEY = "activio_access_token";
export const AUTH_CHANGE_EVENT = "activio-auth-change";

export const authStorage = {
  getToken: () =>
    typeof window === "undefined"
      ? null
      : window.localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  },
  clearToken: () => {
    window.localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  },
};
