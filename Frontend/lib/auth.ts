export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}

export function setUser(user: object): void {
  localStorage.setItem("user", JSON.stringify(user));
}

export function getUser(): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;
  const u = localStorage.getItem("user");
  return u ? JSON.parse(u) : null;
}
