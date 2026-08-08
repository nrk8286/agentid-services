import fs from "node:fs";

const draftUrl = new URL("../data/google-ads-draft.json", import.meta.url);
const draft = JSON.parse(fs.readFileSync(draftUrl, "utf8"));
const failures = [];

if (draft.draftState !== "PAUSED") failures.push("draftState must remain PAUSED");
if (draft.sharedSettings?.dailyBudgetUsd !== null) failures.push("dailyBudgetUsd must remain unset until owner approval");
if (Object.values(draft.launchGates || {}).some(Boolean)) failures.push("launch gates cannot be pre-approved in the repository draft");

const campaignNames = new Set();
for (const campaign of draft.campaigns || []) {
  if (!campaign.name || campaignNames.has(campaign.name)) failures.push(`invalid or duplicate campaign name: ${campaign.name || "<empty>"}`);
  campaignNames.add(campaign.name);
  if (campaign.status !== "PAUSED") failures.push(`${campaign.name} must remain PAUSED`);
  if (!String(campaign.landingPage || "").startsWith("https://gptmarketplus.com/")) failures.push(`${campaign.name} has a non-canonical landing page`);
  if (String(campaign.path1 || "").length > 15 || String(campaign.path2 || "").length > 15) failures.push(`${campaign.name} display path exceeds 15 characters`);

  for (const adGroup of campaign.adGroups || []) {
    if ((adGroup.headlines || []).length < 3 || (adGroup.headlines || []).length > 15) failures.push(`${adGroup.name} must have 3-15 headlines`);
    if ((adGroup.descriptions || []).length < 2 || (adGroup.descriptions || []).length > 4) failures.push(`${adGroup.name} must have 2-4 descriptions`);
    if (new Set(adGroup.headlines || []).size !== (adGroup.headlines || []).length) failures.push(`${adGroup.name} contains duplicate headlines`);
    for (const headline of adGroup.headlines || []) {
      if (headline.length > 30) failures.push(`${adGroup.name} headline exceeds 30 characters: ${headline}`);
    }
    for (const description of adGroup.descriptions || []) {
      if (description.length > 90) failures.push(`${adGroup.name} description exceeds 90 characters: ${description}`);
    }
    for (const keyword of adGroup.keywords || []) {
      if (!["EXACT", "PHRASE"].includes(keyword.matchType)) failures.push(`${adGroup.name} uses an unapproved launch match type: ${keyword.matchType}`);
    }
  }
}

const serialized = JSON.stringify(draft).toLowerCase();
for (const prohibitedClaim of ["guaranteed results", "guaranteed sales", "guaranteed traffic", "risk free"]) {
  if (serialized.includes(prohibitedClaim)) failures.push(`draft contains prohibited claim: ${prohibitedClaim}`);
}

if (failures.length) {
  for (const failure of failures) console.error(`google ads draft: ${failure}`);
  process.exit(1);
}

const adGroupCount = draft.campaigns.reduce((count, campaign) => count + campaign.adGroups.length, 0);
const keywordCount = draft.campaigns.reduce((count, campaign) => count + campaign.adGroups.reduce((sum, adGroup) => sum + adGroup.keywords.length, 0), 0);
console.log(`Validated ${draft.campaigns.length} paused campaigns, ${adGroupCount} ad groups, and ${keywordCount} exact/phrase keywords.`);
