// hooks/usePaymentImage.js
// Fetches an authenticated payment screenshot via paymentService.getImage (blob)
// and turns it into an object URL. Mirrors the caching pattern already used by
// useAuthImage.js elsewhere in the app — if that hook already covers this shape,
// feel free to swap this out for it directly.

import { useState, useEffect } from 'react';
import { paymentService } from '../../services/api';

// Small in-memory cache so switching between rows/modal doesn't refetch the same file.
const blobUrlCache = new Map();

export default function usePaymentImage(fileName) {
  const [src, setSrc] = useState(blobUrlCache.get(fileName) || null);
  const [loading, setLoading] = useState(!blobUrlCache.has(fileName) && !!fileName);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!fileName) {
      setSrc(null);
      setLoading(false);
      return;
    }

    if (blobUrlCache.has(fileName)) {
      setSrc(blobUrlCache.get(fileName));
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setFailed(false);

    paymentService
      .getImage(fileName)
      .then((res) => {
        if (cancelled) return;
        const url = URL.createObjectURL(res.data);
        blobUrlCache.set(fileName, url);
        setSrc(url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fileName]);

  return { src, loading, failed };
}
