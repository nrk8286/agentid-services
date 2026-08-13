export function tagAssistantDebugResponse(request, response) {
  const url = new URL(request.url);
  const isDebugRequest = url.searchParams.has("gtm_debug") || url.searchParams.has("_dbg");
  const isHtml = String(response.headers.get("content-type") || "").toLowerCase().includes("text/html");
  if (!isDebugRequest || !isHtml) return response;

  const headers = new Headers(response.headers);
  headers.set("cross-origin-opener-policy", "unsafe-none");
  headers.set("cache-control", "private, no-store");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
