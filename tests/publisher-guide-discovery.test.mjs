import assert from "node:assert/strict";
import test from "node:test";
import { includePublishedGuides } from "../publishing/foundry-2026-11-09/guide-discovery.mjs";
import { patchIndex } from "../publishing/foundry-2026-11-09/prepare.mjs";

test("published guides enter discovery without losing legacy URLs or duplicating a guide", () => {
  const legacy = ["https://gptmarketplus.com/", "https://gptmarketplus.com/guides/existing"];
  const articles = [{ slug: "existing", status: "published" }, { slug: "future-guide", status: "published" }, { slug: "draft-guide", status: "draft" }, { slug: "withdrawn", status: "unpublished" }];
  const before = structuredClone({ legacy, articles });
  assert.deepEqual(includePublishedGuides(legacy, articles, { enabled: true, origin: "https://gptmarketplus.com" }), ["https://gptmarketplus.com/guides/existing", "https://gptmarketplus.com/guides/future-guide", "https://gptmarketplus.com/"]);
  assert.deepEqual({ legacy, articles }, before);
});
test("other brands and a disabled publisher retain their exact legacy list", () => {
  const legacy = ["https://agentid.services/"];
  for (const config of [{ enabled: false, origin: "https://gptmarketplus.com" }, { enabled: true, origin: "https://agentid.services" }, { enabled: true, origin: "https://gptmarketplus.com.evil.example" }, { enabled: true, origin: "http://gptmarketplus.com" }]) {
    assert.equal(includePublishedGuides(legacy, [{ slug: "guide", status: "published" }], config), legacy);
  }
});
test("guide slugs stay within the canonical guide path and missing slugs are skipped", () => {
  const result = includePublishedGuides([], [{ status: "published" }, { slug: "", status: "published" }, { slug: "a/b?ref=x#fragment", status: "published" }], { enabled: true, origin: "https://gptmarketplus.com/" });
  assert.deepEqual(result, ["https://gptmarketplus.com/guides/a%2Fb%3Fref%3Dx%23fragment"]);
  assert.equal(new URL(result[0]).search, "");
  assert.equal(new URL(result[0]).hash, "");
});
test("an unrecognized deployed bundle cannot be patched", () => {
  assert.throws(() => patchIndex(Buffer.from("different live source")), /baseline changed/);
});
