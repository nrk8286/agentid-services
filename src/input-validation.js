const EMAIL_EDGE_CHARACTERS = new Set([
  "<", ">", "(", ")", "[", "]", "{", "}", '"', "'", ",", ";",
]);

const HTML_ENTITIES = new Map([
  ["&amp;", "&"],
  ["&quot;", '"'],
  ["&#39;", "'"],
  ["&apos;", "'"],
  ["&lt;", "<"],
  ["&gt;", ">"],
]);

export function stripTrailingSlashes(value) {
  const text = String(value ?? "");
  let end = text.length;
  while (end > 0 && text.charCodeAt(end - 1) === 47) end -= 1;
  return text.slice(0, end);
}

export function normalizeEmailAddress(value, maxLength = 160) {
  const email = String(value ?? "").trim().toLowerCase();
  if (!email || email.length > maxLength) return "";

  let atIndex = -1;
  let lastDomainDot = -1;
  for (let index = 0; index < email.length; index += 1) {
    const character = email[index];
    const code = email.charCodeAt(index);
    if (code <= 32 || code === 127 || character.trim() === "") return "";
    if (character === "@") {
      if (atIndex !== -1) return "";
      atIndex = index;
    } else if (character === "." && atIndex !== -1) {
      lastDomainDot = index;
    }
  }

  if (atIndex <= 0 || atIndex >= email.length - 1) return "";
  if (lastDomainDot <= atIndex + 1 || lastDomainDot >= email.length - 1) return "";
  return email;
}

export function extractEmailAddress(value, maxLength = 160) {
  const text = String(value ?? "");
  let tokenStart = 0;

  for (let index = 0; index <= text.length; index += 1) {
    const atEnd = index === text.length;
    const code = atEnd ? 32 : text.charCodeAt(index);
    const isBoundary = atEnd || code <= 32 || code === 127 || text[index].trim() === "";
    if (!isBoundary) continue;

    if (index > tokenStart) {
      let candidate = text.slice(tokenStart, index);
      if (candidate.toLowerCase().startsWith("mailto:")) candidate = candidate.slice(7);
      const atIndex = candidate.indexOf("@");
      const labelSeparator = atIndex > 0 ? candidate.lastIndexOf(":", atIndex) : -1;
      if (labelSeparator !== -1) candidate = candidate.slice(labelSeparator + 1);
      let candidateStart = 0;
      let candidateEnd = candidate.length;
      while (candidateStart < candidateEnd && EMAIL_EDGE_CHARACTERS.has(candidate[candidateStart])) candidateStart += 1;
      while (candidateEnd > candidateStart && EMAIL_EDGE_CHARACTERS.has(candidate[candidateEnd - 1])) candidateEnd -= 1;
      const email = normalizeEmailAddress(candidate.slice(candidateStart, candidateEnd), maxLength);
      if (email) return email;
    }
    tokenStart = index + 1;
  }

  return "";
}

export function stripHtmlTags(value) {
  const html = String(value ?? "");
  const output = [];
  let suppressedTag = "";
  let cursor = 0;

  while (cursor < html.length) {
    if (html[cursor] !== "<") {
      if (!suppressedTag) output.push(html[cursor]);
      cursor += 1;
      continue;
    }

    const tagEnd = findHtmlTagEnd(html, cursor + 1);
    if (tagEnd === -1) break;
    const tag = parseHtmlTag(html.slice(cursor + 1, tagEnd));
    if (tag.name === "script" || tag.name === "style") {
      if (tag.closing && suppressedTag === tag.name) suppressedTag = "";
      else if (!tag.closing && !tag.selfClosing) suppressedTag = tag.name;
    }
    if (!suppressedTag) output.push(" ");
    cursor = tagEnd + 1;
  }

  return output.join("");
}

export function decodeHtmlEntitiesOnce(value) {
  const text = String(value ?? "");
  const output = [];
  let cursor = 0;

  while (cursor < text.length) {
    if (text[cursor] === "&") {
      let decoded = false;
      for (const [entity, replacement] of HTML_ENTITIES) {
        if (!text.startsWith(entity, cursor)) continue;
        output.push(replacement);
        cursor += entity.length;
        decoded = true;
        break;
      }
      if (decoded) continue;
    }
    output.push(text[cursor]);
    cursor += 1;
  }

  return output.join("");
}

function findHtmlTagEnd(html, start) {
  let quote = "";
  for (let index = start; index < html.length; index += 1) {
    const character = html[index];
    if (quote) {
      if (character === quote) quote = "";
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === ">") return index;
  }
  return -1;
}

function parseHtmlTag(source) {
  const trimmed = source.trim();
  let cursor = 0;
  let closing = false;
  if (trimmed[cursor] === "/") {
    closing = true;
    cursor += 1;
  }
  while (cursor < trimmed.length && trimmed[cursor].trim() === "") cursor += 1;
  const nameStart = cursor;
  while (cursor < trimmed.length && isHtmlNameCharacter(trimmed.charCodeAt(cursor))) cursor += 1;
  return {
    closing,
    name: trimmed.slice(nameStart, cursor).toLowerCase(),
    selfClosing: trimmed.endsWith("/"),
  };
}

function isHtmlNameCharacter(code) {
  return (code >= 48 && code <= 57)
    || (code >= 65 && code <= 90)
    || (code >= 97 && code <= 122)
    || code === 45
    || code === 58;
}
