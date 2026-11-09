const publisherOrigin = "https://gptmarketplus.com";

// The live publisher and legacy service catalog have separate page collections.
// Keep the legacy list and include published guides in the normal IndexNow flow.
export function includePublishedGuides(legacyUrls, articles, { enabled, origin }) {
  if (!enabled || String(origin).replace(/\/+$/, "") !== publisherOrigin) return legacyUrls;
  const guides = articles
    .filter((article) => article.status === "published" && typeof article.slug === "string" && article.slug.length > 0)
    .map((article) => `${publisherOrigin}/guides/${encodeURIComponent(article.slug)}`);
  return [...new Set([...guides, ...legacyUrls])];
}
