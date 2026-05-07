export const clearSessionCookies = (): void => {
  document.cookie = "omnius_access_token=; Max-Age=0; path=/";
  document.cookie = "omnius_refresh_token=; Max-Age=0; path=/";
};

