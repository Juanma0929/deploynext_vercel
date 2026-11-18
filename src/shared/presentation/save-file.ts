/**
 * Hands a file that is already in memory to the browser to save. The link is
 * to a blob: URL made here, never to the API, so the request that produced
 * the file went through the HTTP client with its Bearer token.
 */
export function saveFile(content: Blob, fileName: string): void {
  const url = URL.createObjectURL(content);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();
  // Give the browser a moment to start the download before freeing the memory.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
