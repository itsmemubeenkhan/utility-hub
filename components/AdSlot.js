'use client';

import { useEffect, useRef } from 'react';

const BANNERS = {
  '728x90': { key: 'f3789710fab16b7643203655cb9f13c2', width: 728, height: 90 },
  '468x60': { key: '5f0107d957eba0cb1de65a236572b180', width: 468, height: 60 },
  '300x250': { key: '23647b2df481c19933496330153afc8f', width: 300, height: 250 },
  '160x600': { key: 'e2ea57b79c928dd248c82dd526982c12', width: 160, height: 600 },
  '160x300': { key: 'f8c582e4a38f82cc9737ba8c7e79c2e1', width: 160, height: 300 },
  '320x50': { key: '16daa2348e8dceab951737ff8833b859', width: 320, height: 50 },
};

export function BannerAd({ size = '300x250' }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const banner = BANNERS[size];
    if (!banner || !hostRef.current) return undefined;

    const host = hostRef.current;
    const options = document.createElement('script');
    options.text = `atOptions = { key: '${banner.key}', format: 'iframe', height: ${banner.height}, width: ${banner.width}, params: {} };`;
    host.appendChild(options);

    const invoke = document.createElement('script');
    invoke.src = `https://staturenonsense.com/${banner.key}/invoke.js`;
    invoke.async = true;
    host.appendChild(invoke);

    return () => host.replaceChildren();
  }, [size]);

  return (
    <aside className="ad-slot" aria-label="Advertisement">
      <span className="ad-label">Advertisement</span>
      <div className="banner-ad" ref={hostRef} style={{ minHeight: BANNERS[size]?.height }} />
    </aside>
  );
}

export function NativeAd() {
  const hostRef = useRef(null);
  const containerId = 'container-3e883b67886030963b48211b97d11608';

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const container = document.createElement('div');
    container.id = containerId;
    host.appendChild(container);
    const script = document.createElement('script');
    script.src = 'https://staturenonsense.com/3e883b67886030963b48211b97d11608/invoke.js';
    script.async = true;
    script.dataset.cfasync = 'false';
    host.appendChild(script);
    return () => host.replaceChildren();
  }, []);

  return (
    <aside className="ad-slot native-ad" aria-label="Advertisement">
      <span className="ad-label">Advertisement</span>
      <div ref={hostRef} />
    </aside>
  );
}

export function SmartlinkAd() {
  return (
    <aside className="smartlink-ad" aria-label="Sponsored link">
      <span className="ad-label">Sponsored</span>
      <a href="https://staturenonsense.com/pzyh2840v8?key=929e3448ed1ddc35bb97edfe9b3cc0b4" target="_blank" rel="sponsored noopener noreferrer">
        Visit our sponsor
      </a>
    </aside>
  );
}
