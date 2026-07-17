// student/utils/useAuthImage.js
import { useEffect, useRef, useState } from "react";

/**
 * useAuthImage
 * Resolves a raw image filename (as stored on category/content records,
 * e.g. category.imageName) into a real, browser-usable blob URL by
 * calling an authenticated fetcher — typically categoryService.getImage —
 * that hits a protected endpoint and returns the image as a Blob.
 *
 * IMPORTANT: `imageFetcher` must be an axios call configured with
 * `responseType: "blob"` (or equivalent), since this hook expects
 * `res.data` to be a Blob, not JSON. e.g.:
 *
 *   getImage: (filename) =>
 *     api.get(`/categories/image/${filename}`, { responseType: "blob" })
 *
 * Usage (same pattern as CourseCard / ProgressCard):
 *   const { url, isLoading } = useAuthImage(category.imageName, categoryService.getImage);
 *
 * @param {string|null|undefined} filename - raw filename from the API record
 * @param {(filename: string) => Promise<{ data: Blob }>} imageFetcher
 * @returns {{ url: string|null, isLoading: boolean, error: Error|null }}
 */
const useAuthImage = (filename, imageFetcher) => {
  const [url, setUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(filename));
  const [error, setError] = useState(null);
  const objectUrlRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    // Revoke whatever blob URL we made last time before making a new one,
    // so we don't leak memory as `filename` changes across re-renders.
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (!filename || !imageFetcher) {
      setUrl(null);
      setIsLoading(false);
      setError(null);
      return undefined;
    }

    setIsLoading(true);
    setError(null);

    imageFetcher(filename)
      .then((res) => {
        if (!isMounted) return;
        const blob = res?.data;
        if (!blob || !(blob instanceof Blob)) {
          setUrl(null);
          return;
        }
        const objectUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objectUrl;
        setUrl(objectUrl);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err);
        setUrl(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
    // Re-run only when the filename or fetcher identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filename, imageFetcher]);

  // Revoke the last blob URL when the component using this hook unmounts.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  return { url, isLoading, error };
};

export default useAuthImage;
