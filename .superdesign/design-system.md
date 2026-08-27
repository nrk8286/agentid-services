# GPTMarketPlus storefront design system

## Product context

GPTMarketPlus sells practical digital AI-agent products and fixed-scope automation services to small businesses. The immediate storefront target is a product catalog led by an **Auto Dropshipping Agent Team**: a paid, private workspace that creates a personalized operating pack for product research, supplier screening, margin planning, listing preparation, monitoring rules, and customer-support drafts.

The product must be useful without making deceptive earnings claims. It does not promise passive income, guaranteed sales, automatic supplier approval, automatic marketplace publishing, or unattended financial decisions. Publishing products, changing prices, placing orders, issuing refunds, contacting suppliers, and handling customer money require human approval. The buyer remains merchant of record and is responsible for marketplace, consumer, tax, privacy, and supplier compliance.

## Jobs to be done

- Help a first-time ecommerce operator turn a niche and budget into a structured, reviewable launch plan.
- Show exactly what each agent does and where human approval is required.
- Deliver a real private workspace/download immediately after verified PayPal capture.
- Make price, inclusions, limitations, refund policy, and delivery steps obvious before checkout.
- Provide useful free proof before purchase: a sample agent run, margin example, and output preview.
- Cross-sell the existing $29 AI Agent Launch Kit and $24 AI Software Opportunity Report without diluting the flagship offer.

## Information architecture

- `/products`: catalog with the flagship dropshipping team, existing digital products, comparison, buyer FAQ, and clear fulfillment disclosures.
- `/products/auto-dropshipping-agent-team`: product detail and checkout with sample output, agent roster, workflow, requirements, limitations, and PayPal purchase.
- Private product workspace after payment: store brief, agent outputs, approval queue, copy/download actions, rerun limits, and support link.
- Existing `/pricing`, `/ai-agent-launch-kit`, policies, onboarding, and customer dashboard remain connected.

## Visual language

- Keep the established dark, technical GPTMarketPlus identity.
- Background: deep navy/black with subtle cyan and blue radial light.
- Surfaces: translucent navy glass cards, thin cyan borders, high legibility.
- Primary accent: `#71d6ff`; secondary accent: `#5da0ff`; success: `#6df0c6`; warning: `#f3c46f`.
- Text: `#eef6ff`; secondary text: `#9cb3cc`.
- Font: Segoe UI Variable, Avenir Next, Helvetica Neue, Arial, sans-serif only.
- Radius scale: 12/16/20/28px. Buttons may be pill-shaped but must remain recognizably buttons.
- Use restrained shadows and no novelty gradients, purple/pink palettes, decorative type, or fake app screenshots.
- Use simple inline line icons or labeled status chips; the source brand is text-only and has no image logo asset.

## Storefront composition

- Hero: concrete product name, one-sentence outcome, one-time price, primary checkout CTA, secondary sample CTA, and plain-language human-approval disclaimer.
- Proof strip: secure PayPal delivery, one-time purchase, private workspace, no revenue guarantee.
- Agent roster: six compact role cards connected to one approval queue.
- Interactive-looking sample workspace: product candidates, landed-cost math, risk flags, listing draft, and approval states using realistic example data clearly labeled as a sample.
- Deliverables: scannable checklist and downloadable formats.
- Buyer-fit split: “Good fit” and “Not a fit” with candid requirements.
- Product shelf: flagship plus the existing Launch Kit and Opportunity Report.
- FAQ: delivery, tools, supplier data, AI limitations, refunds, and earnings claims.
- Final checkout: repeats price, delivery timing, refund-policy link, and exact scope.

## Components and behavior

- Reuse the sticky `SiteNav`, `SiteFooter`, shared section headings, glass cards, pills, and button styles.
- Primary CTA uses a cyan-to-blue fill with dark readable text; secondary CTA uses bordered glass.
- Product cards must show price, billing cadence, delivery method, and one outcome-oriented sentence without hiding limitations.
- Checkout controls remain visually distinct from navigation and ad placements.
- Forms have visible labels, autocomplete where appropriate, live status, and no placeholder-only labels.
- Hover motion: 180ms transform/background/border transitions. Respect reduced motion.
- Desktop max width 1180px; tablet collapses multi-column content; mobile uses one column and full-width CTA buttons.

## Trust and policy requirements

- Never position advertisements as navigation or download buttons.
- Label samples, sponsored content, private areas, and external links clearly.
- Do not state or imply guaranteed revenue, guaranteed product winners, zero-risk suppliers, or fully unattended operations.
- Explain that marketplace publishing, supplier outreach, price changes, orders, refunds, and customer communications require review.
- Show terms, privacy, refund policy, contact, and delivery disclosures near checkout.
- Use verified capture state for paid access; never grant access from client-only success parameters.
