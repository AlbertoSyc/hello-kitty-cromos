import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
  res.setHeader('Content-Type', 'application/json');

  return res.status(200).json({
    enabled: process.env.ADMOB_ENABLED === 'true',
    bannerAdUnitId: process.env.ADMOB_BANNER_AD_UNIT_ID || '',
    isTesting: process.env.ADMOB_IS_TESTING === 'true',
    npa: process.env.ADMOB_NPA === 'true',
    tagForUnderAgeOfConsent: process.env.ADMOB_TAG_FOR_UNDER_AGE === 'true',
  });
}
