export function stripHtml(html?: string): string {
  if (!html) return "";

  if (typeof window === "undefined") {
    // Fallback for SSR
    return html.replace(/<[^>]*>/g, "");
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}
