const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(
  /\/$/,
  "",
);
export const isAdminApiConfigured = Boolean(API_BASE_URL);

export class ApiError extends Error {
  constructor(message, { status, details } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const AUTH_STORAGE_KEYS = [
  "slms_access_token",
  "slms_admin_session",
  "token",
  "user",
  "slms_user",
];

const clearAuthStorage = () => {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    for (const key of AUTH_STORAGE_KEYS) storage.removeItem(key);
  }
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0].trim();
    if (name) document.cookie = `${name}=; Max-Age=0; path=/`;
  });
};

const isAuthenticationRequest = (path) =>
  /\/(?:auth|admin)\/(login|register|logout|password-reset)/.test(path);

const handleAuthenticationFailure = (status, path, failedToken) => {
  if (![401, 403].includes(status) || isAuthenticationRequest(path)) return;
  let session;
  try {
    session = JSON.parse(
      window.localStorage.getItem("slms_admin_session") || "null",
    );
  } catch {
    session = null;
  }
  if (!session?.token || !failedToken || session.token !== failedToken) return;

  clearAuthStorage();
  const redirectTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.dispatchEvent(
    new CustomEvent("slms:session-expired", {
      detail: {
        message: "Your session has been expired. Please login again.",
        redirectTo: redirectTo === "/login" ? "/" : redirectTo,
        status,
      },
    }),
  );
};

export const adminRequest = async (path, options = {}) => {
  if (!API_BASE_URL) throw new ApiError("API is not configured.");
  let session;
  try {
    session = JSON.parse(
      window.localStorage.getItem("slms_admin_session") || "null",
    );
  } catch {
    session = null;
  }
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");
  if (options.body !== undefined) headers.set("Content-Type", "application/json");
  const requestToken = session?.token || null;
  if (requestToken) headers.set("Authorization", `Bearer ${requestToken}`);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      body:
        options.body === undefined || typeof options.body === "string"
          ? options.body
          : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError("Unable to reach the API. Please try again.");
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    handleAuthenticationFailure(response.status, path, requestToken);
    throw new ApiError(body?.message || "The request could not be completed.", {
      status: response.status,
      details: body,
    });
  }
  return body?.data ?? body;
};
