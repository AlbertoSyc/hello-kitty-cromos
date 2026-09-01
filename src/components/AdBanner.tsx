import { useEffect } from 'react';
import { initializeAds } from '../services/ads';

export default function AdBanner() {
  useEffect(() => {
    void initializeAds();
  }, []);
  return null;
}
