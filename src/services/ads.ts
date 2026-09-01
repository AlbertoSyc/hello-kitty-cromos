import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';

type AdConfig = {
  enabled: boolean;
  bannerAdUnitId?: string;
  isTesting?: boolean;
  npa?: boolean;
  tagForUnderAgeOfConsent?: boolean;
};

const configUrl = import.meta.env.VITE_AD_CONFIG_URL || '';
let loadedConfig: AdConfig | null = null;

async function getConfig(): Promise<AdConfig> {
  if (loadedConfig) return loadedConfig;
  if (!configUrl) return (loadedConfig = { enabled: false });
  try {
    const response = await fetch(configUrl, { headers: { Accept: 'application/json' } });
    if (!response.ok) return (loadedConfig = { enabled: false });
    const data = await response.json();
    return (loadedConfig = {
      enabled: data.enabled === true,
      bannerAdUnitId: typeof data.bannerAdUnitId === 'string' ? data.bannerAdUnitId : undefined,
      isTesting: data.isTesting === true,
      npa: data.npa === true,
      tagForUnderAgeOfConsent: data.tagForUnderAgeOfConsent === true,
    });
  } catch {
    return (loadedConfig = { enabled: false });
  }
}

export async function initializeAds() {
  if (!Capacitor.isNativePlatform()) return;
  const config = await getConfig();
  if (!config.enabled || !config.bannerAdUnitId) return;

  try {
    // UMP consent is handled by the native AdMob plugin. In the EEA/UK this
    // can show Google's configured consent form before an ad is requested.
    let consent = await AdMob.requestConsentInfo({
      tagForUnderAgeOfConsent: config.tagForUnderAgeOfConsent === true,
    });
    if (!consent.canRequestAds && consent.isConsentFormAvailable) {
      consent = await AdMob.showConsentForm();
    }
    if (!consent.canRequestAds) return;

    await AdMob.initialize({ initializeForTesting: config.isTesting === true });
    await AdMob.showBanner({
      adId: config.bannerAdUnitId,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: config.isTesting === true,
      npa: config.npa === true,
    });
  } catch (error) {
    console.warn('AdMob could not be initialized', error);
  }
}

export async function hideAds() {
  if (!Capacitor.isNativePlatform()) return;
  await AdMob.hideBanner().catch(() => undefined);
}
