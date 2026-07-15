// student/hooks/useRemoteImage.js
import { useEffect, useRef, useState } from "react";

/**
 * useRemoteImage
 * Resolves an <img src> for a filename that has to be fetched through an
 * authenticated API call (e.g. categoryService.getImage) rather than being
 * a directly loadable URL.
 *
 * - If `fileName` is already a full URL (http/https/data/blob), it's used
 *   as-is — no network call needed.
 * - Otherwise `fetcher(fileName)` is called (expects an axios response with
 *   a Blob in `res.data`, i.e. { responseType: "blob" }), and the resulting
 *   object URL is returned.
 * - Object URLs are revoked on filename change / unmount to avoid leaking
 *   memory.
 */
export default function useRemoteImage(fileName, fetcher) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const objectUrlRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    // Clean up whatever blob URL we were showing before.
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setUrl(null);
    setLoading(false);

    if (!fileName) return;

    // Already a usable URL — nothing to fetch.
    if (/^(https?:|data:|blob:)/i.test(fileName)) {
      setUrl(fileName);
      return;
    }

    if (typeof fetcher !== "function") {
      console.warn("useRemoteImage: no imageFetcher provided for", fileName);
      return;
    }

    setLoading(true);
    fetcher(fileName)
      .then((res) => {
        if (cancelled) return;
        const objectUrl = URL.createObjectURL(res.data);
        objectUrlRef.current = objectUrl;
        setUrl(objectUrl);
      })
      .catch((err) => {
        console.error(`useRemoteImage: failed to load "${fileName}"`, err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileName, fetcher]);

  // Revoke on unmount too.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  return { url, loading };
}