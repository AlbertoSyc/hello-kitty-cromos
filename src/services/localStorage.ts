import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import demo from '../data/DEMO.json';

export type LocalProfile = {
  profile: string;
  cards: Record<string, number>;
  photos: Record<string, string>;
};

const PROFILE_DIR = 'profiles';
const PHOTO_DIR = 'photos';
const LAST_PROFILE_KEY = 'hk-last-profile';
const PROFILE_RE = /^[A-Z0-9_-]{1,40}$/;

function profileFile(profile: string) {
  return `${PROFILE_DIR}/${profile}.json`;
}

function photoFile(profile: string, cardId: string) {
  return `${PHOTO_DIR}/${profile}/${cardId}.jpg`;
}

function normalizeProfile(profile: string) {
  const normalized = profile.trim().toUpperCase();
  return PROFILE_RE.test(normalized) ? normalized : '';
}

function cloneDemo(profile: string): LocalProfile {
  return {
    profile,
    cards: { ...(demo.cards as Record<string, number>) },
    photos: {},
  };
}

async function ensureDirectories() {
  await Filesystem.mkdir({ path: PROFILE_DIR, directory: Directory.Data, recursive: true }).catch(() => undefined);
  await Filesystem.mkdir({ path: PHOTO_DIR, directory: Directory.Data, recursive: true }).catch(() => undefined);
}

async function readNativeProfile(profile: string): Promise<LocalProfile | null> {
  await ensureDirectories();
  try {
    const result = await Filesystem.readFile({ path: profileFile(profile), directory: Directory.Data, encoding: 'utf8' });
    const parsed = JSON.parse(String(result.data));
    return {
      profile,
      cards: parsed.cards && typeof parsed.cards === 'object' ? parsed.cards : {},
      photos: parsed.photos && typeof parsed.photos === 'object' ? parsed.photos : {},
    };
  } catch {
    return null;
  }
}

async function writeNativeProfile(data: LocalProfile) {
  await ensureDirectories();
  await Filesystem.writeFile({
    path: profileFile(data.profile),
    directory: Directory.Data,
    data: JSON.stringify(data, null, 2),
    encoding: 'utf8',
    recursive: true,
  });
}

export async function loadProfile(rawProfile: string): Promise<LocalProfile> {
  const profile = normalizeProfile(rawProfile);
  if (!profile) throw new Error('Perfil no válido.');

  if (!Capacitor.isNativePlatform()) {
    const key = `hk-profile-${profile}`;
    const existing = localStorage.getItem(key);
    if (existing) return JSON.parse(existing) as LocalProfile;
    const created = cloneDemo(profile);
    localStorage.setItem(key, JSON.stringify(created));
    localStorage.setItem(LAST_PROFILE_KEY, profile);
    return created;
  }

  const existing = await readNativeProfile(profile);
  if (existing) {
    localStorage.setItem(LAST_PROFILE_KEY, profile);
    return existing;
  }

  const created = cloneDemo(profile);
  await writeNativeProfile(created);
  localStorage.setItem(LAST_PROFILE_KEY, profile);
  return created;
}

export async function saveProfile(data: LocalProfile) {
  if (!Capacitor.isNativePlatform()) {
    localStorage.setItem(`hk-profile-${data.profile}`, JSON.stringify(data));
    return;
  }
  await writeNativeProfile(data);
}

export async function saveCard(profile: LocalProfile, cardId: string, quantity: number): Promise<LocalProfile> {
  const next: LocalProfile = {
    ...profile,
    cards: { ...profile.cards, [cardId]: quantity },
    photos: { ...profile.photos },
  };
  await saveProfile(next);
  return next;
}

export async function saveCardPhoto(profile: LocalProfile, cardId: string, base64: string): Promise<LocalProfile> {
  const fileName = photoFile(profile.profile, cardId);
  if (Capacitor.isNativePlatform()) {
    await Filesystem.mkdir({
      path: `${PHOTO_DIR}/${profile.profile}`,
      directory: Directory.Data,
      recursive: true,
    });
    await Filesystem.writeFile({
      path: fileName,
      directory: Directory.Data,
      data: base64,
      recursive: true,
    });
  } else {
    // Web fallback: retain the data URL locally. The Android build uses the native file path.
    const dataUrl = `data:image/jpeg;base64,${base64}`;
    const next = { ...profile, photos: { ...profile.photos, [cardId]: dataUrl } };
    await saveProfile(next);
    return next;
  }

  const next = { ...profile, photos: { ...profile.photos, [cardId]: fileName } };
  await saveProfile(next);
  return next;
}

export async function getPhotoUrl(profile: string, storedPath?: string): Promise<string | null> {
  if (!storedPath) return null;
  if (!Capacitor.isNativePlatform()) return storedPath;
  try {
    const result = await Filesystem.getUri({ path: storedPath, directory: Directory.Data });
    return Capacitor.convertFileSrc(result.uri);
  } catch {
    return null;
  }
}

export function getLastProfile() {
  return localStorage.getItem(LAST_PROFILE_KEY) || '';
}

export function clearSession() {
  localStorage.removeItem('hk-session-profile');
}
