export const getProxiedImageUrl = (url: string | null | undefined): string => {
  if (!url) return "/placeholder.png";

  const apiBase = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  // Already proxied (e.g. re-run through this function twice, or the
  // backend already returned a proxied path) - don't wrap it again.
  if (url.includes("/api/images/")) return url;

  const storageIndex = url.indexOf("/storage/");

  if (storageIndex !== -1) {
    // Full or relative URL containing a Spatie storage path - extract
    // everything after "/storage/" and route it through our own proxy
    // regardless of what origin the URL originally pointed to. This is
    // the important fix: previously, a full http(s) URL WITH "/storage/"
    // in it still fell into this branch correctly, but a URL that had
    // "/storage/" further down a different host (e.g. a CDN or S3-backed
    // disk) would have been treated the same way, which is fine - but a
    // raw relative path shape mismatch was silently returned as-is below.
    const path = url.substring(storageIndex + "/storage/".length);
    return `${apiBase}/api/images/${path}`;
  }

  // No "/storage/" segment at all.
  if (url.startsWith("http")) {
    // A genuine external/full URL with no storage segment - trust it.
    return url;
  }

  // Anything else (a bare relative path with no scheme and no /storage/,
  // e.g. "5/87092535.jpg" returned directly) - treat it as a storage path
  // too, since that's the only other shape these URLs take, rather than
  // returning an unusable relative path that resolves against the
  // frontend's own origin and 404s.
  const cleanPath = url.replace(/^\/+/, "");
  return `${apiBase}/api/images/${cleanPath}`;
};