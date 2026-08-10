export const getProxiedImageUrl = (url: string | null | undefined): string => {
  if (!url) return "/placeholder.png";
  if (url.startsWith('http') && !url.includes('/storage/')) return url;

  // Find the position of '/storage/' and take everything after it
  const storageIndex = url.indexOf('/storage/');
  
  if (storageIndex === -1) return url; // Not a storage URL, return as is

  // Get the path part (e.g., "5/87092535-30-053.jpg")
  const path = url.substring(storageIndex + '/storage/'.length);
  
  const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
  
  return `${apiBase}/api/images/${path}`;
};