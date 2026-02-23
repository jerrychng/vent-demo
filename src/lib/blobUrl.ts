const BLOB_HOST = "blob.core.windows.net";

/**
 * Appends a container/blob SAS query string to Azure Blob URLs for browser reads.
 * - Keeps non-blob URLs unchanged.
 * - Keeps URLs that already have `sig=` unchanged.
 */
export function withBlobSas(url: string | null | undefined): string | null {
  if (!url) return null;
  if (!url.includes(BLOB_HOST)) return url;
  if (url.includes("sig=")) return url;

  const sas = process.env.NEXT_PUBLIC_BLOB_SAS_TOKEN?.trim();
  if (!sas) return url;
  const normalized = sas.startsWith("?") ? sas.slice(1) : sas;
  return `${url}${url.includes("?") ? "&" : "?"}${normalized}`;
}
