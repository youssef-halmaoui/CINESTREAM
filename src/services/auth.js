const USERS_KEY = "cinestream_users";
const SESSION_KEY = "cinestream_session";
const FAVORITES_KEY = "cinestream_favorites";

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getCurrentUser() {
  return readJson(SESSION_KEY, null);
}

export function registerUser({ name, email, password }) {
  const users = readJson(USERS_KEY, []);
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error("An account with this email already exists.");
  }

  const user = {
    id: Date.now().toString(),
    name: name.trim(),
    email: normalizedEmail,
    password
  };

  users.push(user);
  writeJson(USERS_KEY, users);
  writeJson(SESSION_KEY, { id: user.id, name: user.name, email: user.email });

  return getCurrentUser();
}

export function loginUser({ email, password }) {
  const users = readJson(USERS_KEY, []);
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(
    (item) => item.email === normalizedEmail && item.password === password
  );

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  writeJson(SESSION_KEY, { id: user.id, name: user.name, email: user.email });
  return getCurrentUser();
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
}

export function getFavorites(userId) {
  const favorites = readJson(FAVORITES_KEY, {});
  return favorites[userId] || [];
}

export function isFavorite(userId, mediaId) {
  return getFavorites(userId).some((item) => String(item.id) === String(mediaId));
}

export function toggleFavorite(userId, item) {
  const favorites = readJson(FAVORITES_KEY, {});
  const userFavorites = favorites[userId] || [];
  const exists = userFavorites.some((favorite) => String(favorite.id) === String(item.id));

  favorites[userId] = exists
    ? userFavorites.filter((favorite) => String(favorite.id) !== String(item.id))
    : [item, ...userFavorites];

  writeJson(FAVORITES_KEY, favorites);
  return favorites[userId];
}
