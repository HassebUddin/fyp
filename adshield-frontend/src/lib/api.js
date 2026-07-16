// ---------------------------------------------------------------------------
// Real backend client. Talks to the Flask + MongoDB API — replaces the
// mockAuth/mockData modules used while the frontend was built standalone.
// Set VITE_API_BASE_URL in .env to point this at your running backend
// (defaults to http://localhost:5000 for local development).
// ---------------------------------------------------------------------------

// Empty = same origin (Vite proxies /api + /socket.io to the Node backend in
// dev). Set VITE_API_BASE_URL only when the API is on a different host.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";
const SESSION_KEY = "adshield_session";

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const session = getSession();
    if (session?.accessToken) headers.Authorization = `Bearer ${session.accessToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    Object.assign(err, data);
    throw err;
  }
  return data;
}

// ---- session (JWT + user info), persisted in localStorage -----------------

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setSession(accessToken, user) {
  const session = { accessToken, ...user };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function logOut() {
  localStorage.removeItem(SESSION_KEY);
}

// ---- pending signup (which email is mid-verification) --------------------

const PENDING_EMAIL_KEY = "adshield_pending_email";
const PENDING_DEV_OTP_KEY = "adshield_pending_dev_otp";

export function setPendingEmail(email) {
  sessionStorage.setItem(PENDING_EMAIL_KEY, email);
}

export function getPendingEmail() {
  return sessionStorage.getItem(PENDING_EMAIL_KEY);
}

export function clearPendingEmail() {
  sessionStorage.removeItem(PENDING_EMAIL_KEY);
  sessionStorage.removeItem(PENDING_DEV_OTP_KEY);
}

export function setPendingDevOtp(otp) {
  if (otp) sessionStorage.setItem(PENDING_DEV_OTP_KEY, otp);
  else sessionStorage.removeItem(PENDING_DEV_OTP_KEY);
}

export function getPendingDevOtp() {
  return sessionStorage.getItem(PENDING_DEV_OTP_KEY);
}

// ---- auth -------------------------------------------------------------

export function signUp({ storeName, email, platform, password }) {
  return request("/api/auth/signup", {
    method: "POST",
    body: { storeName, email, platform, password },
  }).then((data) => {
    setPendingEmail(email);
    setPendingDevOtp(data.devOtp || null);
    return data;
  });
}

export function verifyOtp({ email, code }) {
  return request("/api/auth/verify-otp", { method: "POST", body: { email, code } }).then(
    (data) => {
      clearPendingEmail();
      return setSession(data.accessToken, data.user);
    }
  );
}

export function resendOtp({ email }) {
  return request("/api/auth/resend-otp", { method: "POST", body: { email } }).then((data) => {
    setPendingDevOtp(data.devOtp || null);
    return data;
  });
}

export function logIn({ email, password }) {
  return request("/api/auth/login", { method: "POST", body: { email, password } }).then(
    (data) => setSession(data.accessToken, data.user),
    (err) => {
      if (err.needsVerification) setPendingEmail(email);
      throw err;
    }
  );
}

// ---- dashboard ----------------------------------------------------------

export function fetchSummary() {
  return request("/api/dashboard/summary", { auth: true });
}

export function fetchEvents() {
  return request("/api/dashboard/events", { auth: true }).then((d) => d.events);
}

export function fetchScriptSnippet() {
  return request("/api/dashboard/script", { auth: true });
}

export { API_BASE };
