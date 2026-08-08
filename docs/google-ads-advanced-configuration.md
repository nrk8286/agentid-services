# Google Ads advanced configuration

Status: **prepared but not launched** on 2026-08-07.

The active advertiser is GPTMarketPlus at `https://gptmarketplus.com`. The working draft is in `data/google-ads-draft.json`; its campaigns are intentionally `PAUSED`, its budget is intentionally unset, and every launch gate defaults to `false`.

## Confirmed audit results

- GA4 is live through the first-party `/gtag` path using `G-3BCSR51WHZ`.
- The public measurement endpoint reports that Google Ads conversion tracking is not configured because the conversion ID and label are empty.
- The site now emits the canonical `generate_lead` event only after a contact request, strategy-call request, or chat lead is accepted by the server. Lead-magnet downloads remain secondary events.
- Future native Google Ads conversion events are deduplicated by transaction or lead ID in the browser session.
- The $29 purchase flow is payment-gated, but a native Ads purchase conversion cannot be considered complete until it is sent only after provider-verified capture with the actual value and a unique transaction ID.
- AdSense is separate from Google Ads. Its publisher code, manual unit, and `ads.txt` record are installed, but Google still reports the site under review. Approval, impressions, earnings, and settlement are not verified.
- The saved Google account in the Chromium profile is signed out. No Google Ads account, billing profile, campaign history, conversion action, or existing budget could be audited.

## Required account configuration

1. Sign in to the owner-controlled Google Ads account.
2. Link GA4 property `514250564`, but keep imported GA4 events secondary for observation until native Ads conversions are verified.
3. Create a native website lead conversion named `GPTMarketPlus - Qualified Lead`:
   - Goal category: Submit lead form.
   - Count: One.
   - Primary: Yes for the lead campaign only.
   - Value: Do not invent a revenue value. Use no value until the owner defines a defensible qualified-lead value.
   - Attribution: Data-driven when the account is eligible.
4. Create a native website purchase conversion named `GPTMarketPlus - Launch Kit Purchase`:
   - Goal category: Purchase.
   - Count: Every.
   - Primary: Yes for the sales campaign only.
   - Value: Dynamic transaction value; currently USD 29 for the Launch Kit.
   - Transaction ID: Required for deduplication.
   - Attribution: Data-driven when eligible.
5. Install separate Worker destinations for the two native actions: `GOOGLE_ADS_LEAD_CONVERSION_ID` plus `GOOGLE_ADS_LEAD_CONVERSION_LABEL`, and `GOOGLE_ADS_PURCHASE_CONVERSION_ID` plus `GOOGLE_ADS_PURCHASE_CONVERSION_LABEL`. The legacy generic ID and label remain a lead-only fallback. Do not paste account credentials into source control.
6. Verify both actions with Tag Assistant and Google Ads diagnostics. A tag being present is not proof that a real conversion was received.
7. Keep enhanced conversions disabled until customer-data terms, consent handling, data minimization, and the exact implementation path are approved. Current Google guidance routes new offline/enhanced-conversion uploads through Data Manager.

## Campaign architecture

### 1. AI Automation Services — lead generation

- Network: Google Search only. Search Partners and Display expansion off during the pilot.
- Location: United States; presence setting must be people in or regularly in the location, not interest-only traffic.
- Language: English.
- Match types: Exact and phrase at launch. Broad match requires proven conversion quality and a controlled experiment.
- Audience segments: Observation only so the campaign does not accidentally narrow reach.
- Primary goal: Server-accepted `generate_lead` from contact, booking, or a captured chat lead.
- Landing page: `/book-a-consultation`.
- Initial bidding: Maximize conversions without a target CPA, only after real conversion receipt is verified.
- Later bidding: Test Target CPA after enough genuine conversions establish a stable baseline. Do not select a target from guesswork.

### 2. AI Agent Launch Kit — sales

- Network, location, language, and match-type controls are the same as the lead campaign.
- Primary goal: Provider-verified `purchase` with dynamic value and unique transaction ID.
- Landing page: `/ai-agent-launch-kit`.
- Initial bidding: Remain paused until native purchase tracking passes a real acceptance test. Then test Maximize conversion value.
- Later bidding: Test Target ROAS only after reported revenue is complete and conversion volume is sufficient.

Performance Max, Display, Demand Gen, and YouTube are deferred. They need verified conversion economics plus image/video assets and brand-safety controls; enabling them now would broaden spend before the core Search signal is trustworthy.

## Controls and experiments

- Keep auto-apply recommendations off. Review recommendations individually.
- Do not use account-default goals across both campaigns; apply campaign-specific lead and purchase goals.
- Use the shared negative-keyword file and review the search-terms report at least twice weekly during the pilot.
- Apply portfolio or target-based bidding only after the corresponding conversion action is stable.
- Run one material experiment at a time: ad message, landing page, match type, or bid strategy.
- Do not change budget and bidding simultaneously; that makes causality difficult to interpret.
- Exclude owner, QA, and known test traffic from business reporting. Never create synthetic leads or purchases to improve apparent performance.
- Use final-URL UTMs such as `utm_source=google`, `utm_medium=cpc`, `utm_campaign={campaignid}`, `utm_content={creative}`, and `utm_term={keyword}` while preserving Google auto-tagging.

## Launch gate

The campaign must remain paused until all of these are true:

- The correct advertiser account and billing owner are confirmed.
- A daily budget and maximum acceptable loss are explicitly approved.
- Native lead and purchase actions exist with the correct count settings.
- The real conversion ID and label are installed without committing secrets.
- Tag Assistant observes the intended events exactly once.
- One genuine lead can be reconciled from Google Ads to the server record.
- One owner-authorized real purchase can be reconciled through payment, delivery, analytics, and Ads; refund it afterward when appropriate.
- Privacy and consent behavior is reviewed for every targeted geography.
- All campaign, ad-group, keyword, negative-keyword, asset, location, and URL settings are reviewed in the Google Ads UI before enabling spend.

## First 90 days

- Days 1-30: launch only the better-economics Search campaign after the launch gate passes; inspect search terms, conversion quality, landing-page behavior, and policy diagnostics.
- Days 31-60: remove weak queries, test one RSA message and one landing-page hypothesis, and calculate real CPA or ROAS from verified outcomes.
- Days 61-90: consider broad match, Target CPA, Target ROAS, or a second campaign only when the observed data supports it. Performance Max remains a separate controlled expansion, not a default upgrade.
