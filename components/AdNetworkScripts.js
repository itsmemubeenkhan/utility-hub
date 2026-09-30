'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const AD_SCRIPTS = [
  'https://staturenonsense.com/37/9a/23/379a2384501c3d526d04ad33ecca9b79.js',
  'https://staturenonsense.com/6f/d9/0b/6fd90b30ed5f015f0bb18b1ae05ade13.js',
];
const loadedScripts = new Set();

export default function AdNetworkScripts() {
  const pathname = usePathname();

  useEffect(() => {
    // Keep third-party ads out of the password-protected admin area.
    if (pathname.startsWith('/admin')) return undefined;

    AD_SCRIPTS.forEach((src) => {
      if (loadedScripts.has(src)) return;
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
      loadedScripts.add(src);
    });
  }, [pathname]);

  return null;
}
