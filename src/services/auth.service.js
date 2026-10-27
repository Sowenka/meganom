import { LEGAL_VERSION } from '@/data/legal';

const API_BASE = '/api';
const TOKEN_KEY = 'meganom_token';
const USER_KEY  = 'meganom_user';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// verify.php принимает код только вместе с паролем регистрации, чтобы чужая повторная
// регистрация того же email не могла подменить пароль. Чтобы не просить пароль второй раз,
// он живёт здесь, в памяти вкладки, до подтверждения (после перезагрузки его спросит форма).
let pendingSignUp = null;

/** Пароль только что отправленной регистрации для этого email, или пустая строка. */
export function getPendingPassword(email) {
  return pendingSignUp?.email === email ? pendingSignUp.password : '';
}

export async function signUp({ fullName, email, password, phone, consentPd }) {
  const res = await fetch(`${API_BASE}/auth/register.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName,
      email,
      password,
      phone,
      consent_given: consentPd === true,
      consent_version: LEGAL_VERSION,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка регистрации');
  // Registration now returns { pending: true, email } - no token yet
  pendingSignUp = { email, password };
  return data;
}

export async function verifyEmail({ email, code, password }) {
  const res = await fetch(`${API_BASE}/auth/verify.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Неверный или просроченный код');
  pendingSignUp = null;
  saveSession(data.token, data.user);
  return data;
}

export async function signIn({ email, password }) {
  const res = await fetch(`${API_BASE}/auth/login.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка входа');
  saveSession(data.token, data.user);
  return data;
}

export async function signOut() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function uploadAvatar(file) {
  const token = getToken();
  const formData = new FormData();
  formData.append('avatar', file);
  // Note: do NOT set Content-Type manually - browser sets multipart boundary automatically
  const res = await fetch(`${API_BASE}/auth/upload-avatar.php`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка загрузки фото');
  return data;
}

export async function updateProfile({ name, phone }) {
  const token = getToken();
  const res = await fetch(`${API_BASE}/auth/update-profile.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name, phone: phone || '' }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка обновления профиля');
  return data.user;
}

export async function getSession() {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/me.php`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return null;
    }
    const data = await res.json();
    return data.user ?? null;
  } catch {
    return null;
  }
}
