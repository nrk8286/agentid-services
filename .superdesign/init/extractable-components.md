# Extractable components

The source is server-rendered JavaScript, so reusable Superdesign templates should preserve the exact public shell while omitting Worker logic.

## SiteNav

- Source: `src/agentid-site.js` (`renderNav`)
- Category: layout
- Description: Sticky glass navigation with text brand, route links, and primary product CTA.
- Extractable props: `activePath`, `ctaHref`, `ctaLabel`
- Hardcoded: GPTMarketPlus text brand, subtitle, visual classes, navigation labels.

## SiteFooter

- Source: `src/agentid-site.js` (`renderFooter`)
- Category: layout
- Description: Four-column footer with brand statement, contact, resources, and policies.
- Extractable props: none required for storefront drafts.
- Hardcoded: section labels, links, and layout.

## SectionHeading

- Source: `src/agentid-site.js` (`renderSectionTitle`)
- Category: basic
- Description: Eyebrow, H2, and optional explanatory copy.
- Extractable props: `eyebrow`, `title`, `description`
- Hardcoded: class names and hierarchy.

## ProductCard

- Source: `src/agentid-site.js` (`renderCardGrid` plus pricing product cards)
- Category: basic
- Description: Glass card with kicker, title, summary, points, price, and CTA.
- Extractable props: `kicker`, `title`, `summary`, `price`, `ctaLabel`, `ctaHref`
- Hardcoded: card structure and visual classes.

## CheckoutPanel

- Source: `src/agentid-site.js` (`renderPricingPage`, `renderLaunchKitPage`)
- Category: basic
- Description: One-time price, PayPal readiness state, checkout form, and fulfillment disclosure.
- Extractable props: `productName`, `price`, `productId`, `ctaLabel`, `paypalReady`
- Hardcoded: PayPal disclosure hierarchy and secure-checkout styling.
