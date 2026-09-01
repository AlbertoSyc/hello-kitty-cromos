import { useCallback, useEffect, useMemo, useState } from 'react';
import cards from './data/cards.json';
import type { Page } from './types';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CardsPage from './pages/CardsPage';
import DuplicatesPage from './pages/DuplicatesPage';
import BottomNavigation from './components/BottomNavigation';
import CelebrationAnimation from './components/CelebrationAnimation';
import Loading from './components/Loading';
import ErrorMessage from './components/ErrorMessage';
import AdBanner from './components/AdBanner';
import { clearSession, getLastProfile, loadProfile, saveCard, saveCardPhoto, type LocalProfile } from './services/localStorage';
import { takeCardPhoto } from './services/camera';

export default function App() {
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [page, setPage] = useState<Page>('home');
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [photoId, setPhotoId] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [celebrate, setCelebrate] = useState(false);
  const [error, setError] = useState('');

  const hydratePhotoUrls = useCallback(async (data: LocalProfile) => {
    const next: Record<string, string> = {};
    const { getPhotoUrl } = await import('./services/localStorage');
    await Promise.all(Object.entries(data.photos || {}).map(async ([id, path]) => {
      const url = await getPhotoUrl(data.profile, path);
      if (url) next[id] = url;
    }));
    setPhotoUrls(next);
  }, []);

  useEffect(() => {
    const last = getLastProfile();
    if (!last) {
      setLoading(false);
      return;
    }
    void loadProfile(last).then(async data => {
      setProfile(data);
      await hydratePhotoUrls(data);
    }).catch(() => undefined).finally(() => setLoading(false));
  }, [hydratePhotoUrls]);

  const login = async (raw: string) => {
    setError('');
    setLoading(true);
    try {
      const data = await loadProfile(raw);
      setProfile(data);
      setPhotoUrls({});
      await hydratePhotoUrls(data);
      setPage('home');
      localStorage.setItem('hk-session-profile', data.profile);
    } catch {
      setError('No se ha podido abrir el Perfil.');
    } finally {
      setLoading(false);
    }
  };

  const changeCard = useCallback(async (id: string, next: number) => {
    if (!profile || next < 0 || savingId) return;
    const previous = profile.cards[id] ?? 0;
    setError('');
    setProfile(current => current ? { ...current, cards: { ...current.cards, [id]: next } } : current);
    setSavingId(id);
    try {
      const data = await saveCard(profile, id, next);
      setProfile(data);
      if (previous === 0 && next === 1) setCelebrate(true);
    } catch {
      setProfile(current => current ? { ...current, cards: { ...current.cards, [id]: previous } } : current);
      setError('No se han podido guardar los cambios en el dispositivo.');
    } finally {
      setSavingId(null);
    }
  }, [profile, savingId]);

  const takePhoto = useCallback(async (id: string) => {
    if (!profile || photoId) return;
    setError('');
    setPhotoId(id);
    try {
      const base64 = await takeCardPhoto();
      if (!base64) return;
      const data = await saveCardPhoto(profile, id, base64);
      setProfile(data);
      const { getPhotoUrl } = await import('./services/localStorage');
      const url = await getPhotoUrl(data.profile, data.photos[id]);
      if (url) setPhotoUrls(current => ({ ...current, [id]: url }));
    } catch (e: any) {
      if (!String(e?.message || '').toLowerCase().includes('cancel')) {
        setError('No se ha podido tomar o guardar la foto. Revisa el permiso de cámara.');
      }
    } finally {
      setPhotoId(null);
    }
  }, [profile, photoId]);

  const logout = () => {
    clearSession();
    setProfile(null);
    setPhotoUrls({});
    setPage('home');
    setError('');
  };

  const content = useMemo(() => {
    if (!profile) return null;
    if (page === 'cards') return <CardsPage cards={cards} userCards={profile.cards} photos={photoUrls} savingId={savingId} onChange={changeCard} onPhoto={takePhoto} />;
    if (page === 'duplicates') return <DuplicatesPage cards={cards} userCards={profile.cards} savingId={savingId} onChange={changeCard} />;
    return <HomePage profile={profile.profile} cards={cards} userCards={profile.cards} onLogout={logout} />;
  }, [page, profile, photoUrls, savingId, changeCard, takePhoto]);

  if (loading) return <Loading text="Cargando colección..." />;
  if (!profile) return <LoginPage onLogin={login} error={error} loading={loading} />;

  return <div className="safe-bottom min-h-screen">
    <AdBanner />
    {celebrate && <CelebrationAnimation onDone={() => setCelebrate(false)} />}
    <main className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-10">
      {error && <div className="mb-5"><ErrorMessage message={error} /></div>}
      {content}
    </main>
    <BottomNavigation page={page} onNavigate={setPage} />
  </div>;
}
