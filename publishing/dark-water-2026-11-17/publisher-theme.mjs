// One palette for the publisher and the legacy product-page components.
// Scoped by the wrapper so the other domains on this Worker are unaffected.
export const THEME_VERSION = "20261117-dark-water-1";

export const THEME_CSS = String.raw`
html[data-gmp-theme="dark-water"] {
  color-scheme: dark;
  background: #080f16;
  scrollbar-color: #466570 #080f16;
  --gmp-bg: #080f16;
  --gmp-panel: #101e29;
  --gmp-raised: #162835;
  --gmp-text: #eef6fa;
  --gmp-muted: #b4c6ce;
  --gmp-accent: #7de0d2;
  --gmp-line: #344c58;
  --gmp-button-ink: #052220;
  --bg: var(--gmp-bg);
  --bg-alt: #0c1822;
  --surface: rgba(16,30,41,.94);
  --surface-2: rgba(22,40,53,.96);
  --text: var(--gmp-text);
  --muted: var(--gmp-muted);
  --muted-2: #a7bcc6;
  --line: var(--gmp-line);
  --line-strong: #4e717c;
  --accent: var(--gmp-accent);
  --accent-2: #9bd9ee;
  --success: #91e6bf;
  --warning: #f1ce93;
  --danger: #ffabb5;
}
html[data-gmp-theme="dark-water"] body {
  --pub-paper: transparent;
  --pub-white: rgba(16,30,41,.94);
  --pub-ink: var(--gmp-text);
  --pub-muted: var(--gmp-muted);
  --pub-line: var(--gmp-line);
  --pub-teal: var(--gmp-accent);
  --pub-soft: #162c34;
  --pub-gold: #f1ce93;
  --pf-accent: var(--gmp-accent);
  --pf-border: var(--gmp-line);
  min-height: 100vh;
  color: var(--gmp-text);
  background:
    radial-gradient(ellipse at 16% 0%, rgba(33,90,100,.24), transparent 44rem),
    radial-gradient(ellipse at 92% 22%, rgba(25,70,91,.17), transparent 48rem),
    var(--gmp-bg);
  isolation: isolate;
  -webkit-font-smoothing: antialiased;
}
html[data-gmp-theme="dark-water"] body::before { content: none; }
html[data-gmp-theme="dark-water"] [data-portfolio-ui] {
  --pf-accent: var(--gmp-accent);
  --pf-border: var(--gmp-line);
}
html[data-gmp-theme="dark-water"] body > :is(header, main, footer) {
  position: relative;
  z-index: 1;
}
html[data-gmp-theme="dark-water"] #gmp-water-canvas {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
  user-select: none;
  opacity: .8;
  contain: strict;
}
html[data-gmp-theme="dark-water"] ::selection {
  color: #f4ffff;
  background: #286865;
}
html[data-gmp-theme="dark-water"] :is(h1,h2,h3,h4,h5,h6) {
  color: var(--gmp-text);
}
html[data-gmp-theme="dark-water"] :is(h1,h2) em,
html[data-gmp-theme="dark-water"] .pub-library-heading h1 > span {
  color: var(--gmp-accent);
}
html[data-gmp-theme="dark-water"] :is(a,button,input,select,textarea,summary,[tabindex]):focus-visible {
  outline: 3px solid var(--gmp-accent);
  outline-offset: 4px;
}
html[data-gmp-theme="dark-water"] .publisher-header {
  background: rgba(10,23,32,.96);
  border-color: var(--gmp-line);
}
html[data-gmp-theme="dark-water"] .publisher-brand { color: var(--gmp-text); }
html[data-gmp-theme="dark-water"] .publisher-brand span { color: var(--gmp-accent); }
html[data-gmp-theme="dark-water"] .publisher-brand small { color: var(--gmp-muted); }
html[data-gmp-theme="dark-water"] .publisher-nav a {
  color: #d6e4ea;
  transition: color .18s, background .18s, border-color .18s;
}
html[data-gmp-theme="dark-water"] :is(.publisher-nav,.pub-section-nav) a:hover {
  color: var(--gmp-accent);
}
html[data-gmp-theme="dark-water"] .publisher-nav a[aria-current="page"] {
  color: var(--gmp-accent);
  border-color: var(--gmp-accent);
}
html[data-gmp-theme="dark-water"] .publisher-product-link {
  background: #172e36;
  border-color: #52767c;
}
html[data-gmp-theme="dark-water"] .publisher-footer {
  color: var(--gmp-text);
  background: #0b1720;
  border-top: 1px solid var(--gmp-line);
}
html[data-gmp-theme="dark-water"] .publisher-footer :is(p,small) {
  color: var(--gmp-muted);
  border-color: var(--gmp-line);
}
html[data-gmp-theme="dark-water"] .publisher-footer a:hover { color: var(--gmp-accent); }
html[data-gmp-theme="dark-water"] :is(.publisher-policy p,.publisher-policy li,.publisher-recommendation small) {
  color: var(--gmp-muted);
}
html[data-gmp-theme="dark-water"] .publisher-policy a {
  color: var(--gmp-accent);
  text-decoration: underline;
  text-underline-offset: 3px;
}
html[data-gmp-theme="dark-water"] .publisher-legacy-note {
  color: #e7d9b8;
  background: #29271d;
  border-bottom: 1px solid #645b3d;
}

/* Opaque-enough panels keep the decorative water below the reading surface. */
html[data-gmp-theme="dark-water"] :is(
  .pf-start,.pf-start-card,.pub-story-card,.pub-products article,
  .pub-editor-note,.pub-filter-form,.pub-empty,.pub-testing,
  .pub-sidebar-note,.pub-verdict,.pub-strategy,.pub-disclosure,
  .pub-shopping-sponsor,.pub-gaming-sponsor,.pub-featured-sponsor,
  .info-card,.feature-card,.price-card,.support-card,.about-panel,
  .side-note,.selector-card,.blueprint-preview,.blueprint-card,
  .review-panel,.sequence-card,.cta-box,.scenario-preview,
  .marketplace-product-card,.featured-sample-checkout,.human-control-strip,
  .lead-form,.faq-list details,.storefront-faq details,.kit-preview
) {
  color: var(--gmp-text);
  background: rgba(16,30,41,.94);
  border-color: var(--gmp-line);
}
html[data-gmp-theme="dark-water"] :is(.pf-start-card,.pub-story-card,.pub-products article,.pub-shopping-sponsor) {
  box-shadow: 0 14px 36px rgba(0,0,0,.12);
}
html[data-gmp-theme="dark-water"] :is(.pub-story-card,.pub-products article,.pub-shopping-sponsor,.pub-gaming-sponsor,.pub-featured-sponsor) {
  border-radius: 12px;
}
html[data-gmp-theme="dark-water"] .pf-start-card { background: #142631; }
html[data-gmp-theme="dark-water"] .pf-start-card:hover {
  background: #1a333d;
  border-color: var(--gmp-accent);
}
html[data-gmp-theme="dark-water"] .pf-start-card :is(strong,span) { color: var(--gmp-text); }
html[data-gmp-theme="dark-water"] .pf-start-card span,
html[data-gmp-theme="dark-water"] .pf-start-heading p { opacity: 1; color: var(--gmp-muted); }
html[data-gmp-theme="dark-water"] .pub-topic-card { background: rgba(16,30,41,.65); }
html[data-gmp-theme="dark-water"] .pub-topic-card:hover { background: #19343e; }
html[data-gmp-theme="dark-water"] .pub-topic-card > span { color: #9acbc9; }
html[data-gmp-theme="dark-water"] .pub-library-topics a { background: #122630; }
html[data-gmp-theme="dark-water"] .pub-library-topics a:hover { background: #1b3c44; }
html[data-gmp-theme="dark-water"] :is(.pub-disclosure,.pub-testing,.pub-verdict,.pub-strategy) {
  background: rgba(19,39,47,.96);
  color: var(--gmp-muted);
}
html[data-gmp-theme="dark-water"] :is(.pub-testing details,.pub-testing-limits,.pub-testing-top > span) {
  border-color: #3f5b63;
}
html[data-gmp-theme="dark-water"] .pub-disclosure-icon { border-color: #769d9b; }
html[data-gmp-theme="dark-water"] .pub-pros-cons > div {
  background: #122d2b;
  border-color: #75b6a3;
}
html[data-gmp-theme="dark-water"] .pub-pros-cons > div + div {
  background: #2b291f;
  border-color: #d0b77d;
}
html[data-gmp-theme="dark-water"] :is(.pub-filter-form label,.field span,.checkbox span) { color: #d1e1e7; }
html[data-gmp-theme="dark-water"] :is(input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]),select,textarea) {
  background: #0a1720;
  color: var(--gmp-text);
  border-color: #68838e;
  accent-color: var(--gmp-accent);
}
html[data-gmp-theme="dark-water"] :is(input,textarea)::placeholder { color: #a0b6c2; opacity: 1; }
html[data-gmp-theme="dark-water"] option { background: #101e29; color: var(--gmp-text); }
html[data-gmp-theme="dark-water"] :is(input[type="checkbox"],input[type="radio"]) { accent-color: #49b7a6; }
html[data-gmp-theme="dark-water"] :is(pre,.code-block) {
  color: #dceff2;
  background: #0a1720;
  border: 1px solid var(--gmp-line);
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
}
html[data-gmp-theme="dark-water"] :not(pre) > code { color: #a3efdf; }
html[data-gmp-theme="dark-water"] .pub-longform :is(thead th,caption) {
  color: #dbeaf0;
  background: #172d37;
}
html[data-gmp-theme="dark-water"] .pub-longform tbody { background: #0f202b; }
html[data-gmp-theme="dark-water"] .pub-article-body blockquote {
  color: #dceff0;
  background: #142f36;
}
html[data-gmp-theme="dark-water"] :is(.pub-art-label,.pub-art-caption,.pub-note-mark,.pub-feature-aside li > span) {
  color: #a8c6cd;
}
html[data-gmp-theme="dark-water"] .pub-story-art {
  background: radial-gradient(ellipse at 15% 0%,#244c54,transparent 70%),#142a36;
  color: var(--gmp-text);
}
html[data-gmp-theme="dark-water"] .pub-art-document {
  background: #17313c;
  color: #eef6fa;
  border-color: #617f88;
  box-shadow: 7px 7px 0 #10232c,8px 8px 0 #52717b;
}
html[data-gmp-theme="dark-water"] .pub-art-document > span { color: var(--gmp-accent); }
html[data-gmp-theme="dark-water"] .pub-art-document i { background: #71969d; }
html[data-gmp-theme="dark-water"] .pub-art-document > div { border-color: #4e717c; }
html[data-gmp-theme="dark-water"] .pub-byline-mark { background: #234d54; color: #eef6fa; }
html[data-gmp-theme="dark-water"] .pub-shopping-sponsor-image {
  overflow: hidden;
  border-radius: 8px;
  background: #fff;
}
html[data-gmp-theme="dark-water"] :is(.pub-gaming-sponsor-link:hover,.pub-text-link:hover,.pub-inline-link:hover) {
  color: #b5f9eb !important;
}
html[data-gmp-theme="dark-water"] :is(.pub-article-body a,.pub-inline-link) {
  text-decoration-color: #619c97 !important;
}

/* A consistent button palette also fixes the old dark-card/light-body clash. */
html[data-gmp-theme="dark-water"] :is(.pub-button,.button-primary,.nav-cta,.scanner-submit) {
  color: var(--gmp-button-ink) !important;
  background: #7de0d2;
  border-color: #7de0d2;
  border-radius: 9px;
  box-shadow: 0 6px 24px rgba(68,172,157,.12);
  text-shadow: none;
}
html[data-gmp-theme="dark-water"] :is(.pub-button,.button-primary,.nav-cta,.scanner-submit):hover {
  color: #052220 !important;
  background: #a3f0e4;
  border-color: #a3f0e4;
  filter: none;
}
html[data-gmp-theme="dark-water"] :is(.button-secondary,.card-link,.lookup-form button) {
  color: #e0f2f4;
  background: #172f3a;
  border-color: #547782;
  border-radius: 9px;
}
html[data-gmp-theme="dark-water"] :is(.button-secondary,.card-link,.lookup-form button):hover {
  background: #23444d;
  border-color: var(--gmp-accent);
}
html[data-gmp-theme="dark-water"] .scenario-picker .button-secondary[aria-selected="true"] {
  color: #c1fff1;
  background: #1c4c48;
  border-color: #7de0d2;
}
html[data-gmp-theme="dark-water"] :is(.lead-badge,.product-type-badge,.catalog-count,.status-pill,.price-badge) {
  color: #b3f4e6;
  background: #193b3c;
  border-color: #507b7a;
}
html[data-gmp-theme="dark-water"] .product-type-badge.report {
  color: #f1ce93;
  background: #302b21;
  border-color: #776749;
}
html[data-gmp-theme="dark-water"] .form-status {
  color: var(--gmp-text);
  background: #152c36;
  border-color: #547782;
}
html[data-gmp-theme="dark-water"] .form-status.error { color: #ffbbc3; border-color: #b26773; }
html[data-gmp-theme="dark-water"] .form-status.success { color: #a5f0cc; border-color: #5a9c7e; }
html[data-gmp-theme="dark-water"] .publisher-skip,
html[data-gmp-theme="dark-water"] .pf-skip {
  background: #7de0d2;
  color: #052220;
  border-color: #7de0d2;
}

/* Consent remains above content; the water never catches clicks or focus. */
html[data-gmp-theme="dark-water"] .gmp-consent {
  background: #142630;
  color: var(--gmp-text);
  border-color: #65828a;
  box-shadow: 0 18px 64px rgba(0,0,0,.48);
}
html[data-gmp-theme="dark-water"] .gmp-consent p { color: #c1d2d9; }
html[data-gmp-theme="dark-water"] .gmp-consent a { color: #a4f0e3; }
html[data-gmp-theme="dark-water"] .gmp-consent button {
  color: #e6f4f6;
  background: #203d47;
  border-color: #7b999f;
}
html[data-gmp-theme="dark-water"] .gmp-consent button[data-consent-accept] {
  color: #052220;
  background: #7de0d2;
  border-color: #7de0d2;
}
html[data-gmp-theme="dark-water"] :is(.agentid-chat-panel,.agentid-chat-summary,.agentid-chat-fab,.agentid-chat-nudge) {
  color: var(--gmp-text);
  background: #122631;
  border-color: #52737d;
}
html[data-gmp-theme="dark-water"] :is(.chat-close,.chat-chip,.chat-bubble) {
  color: var(--gmp-text);
  border-color: #52737d;
}

/* Small supporting copy was difficult to read even before the color clash. */
html[data-gmp-theme="dark-water"] :is(
  .pub-meta,.pub-trust-line,.pub-story-foot,.pub-story-foot > span,
  .pub-small-label,.pub-product-disclaimer,.pub-product-price > span,
  .pub-product-price small,.pub-topic-card small,.pub-disclosure,
  .pub-shopping-sponsor-disclosure,.pub-gaming-sponsor > p,
  .pub-featured-sponsor > p,.pub-shopping-sponsor-label,
  .pub-featured-sponsor-label,.pub-featured-sponsor-label a,
  .pub-testing-date,.pub-testing-top > span,.pub-byline,
  .pub-byline div > span,.pub-sidebar-note p,.pub-results-heading,
  .pub-library-topics a,.pub-longform caption
) { font-size: .75rem !important; line-height: 1.7; }
html[data-gmp-theme="dark-water"] :is(.pub-kicker,.pub-gaming-sponsor-label) { font-size: .7rem; }
html[data-gmp-theme="dark-water"] .pub-featured-sponsor-label { letter-spacing: .08em; }
html[data-gmp-theme="dark-water"] .pub-disclosure p { max-width: 100%; }
@media (max-width: 480px) {
  html[data-gmp-theme="dark-water"] .pub-home-actions { align-items: stretch; }
  html[data-gmp-theme="dark-water"] .pub-home-actions .pub-text-link { align-self: flex-start; }
  html[data-gmp-theme="dark-water"] .publisher-nav a { min-height: 40px; display: inline-flex; align-items: center; }
}
@media (prefers-reduced-motion: reduce), (hover: none), (pointer: coarse) {
  html[data-gmp-theme="dark-water"] #gmp-water-canvas { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  html[data-gmp-theme="dark-water"] { scroll-behavior: auto; }
  html[data-gmp-theme="dark-water"] *,
  html[data-gmp-theme="dark-water"] *::before,
  html[data-gmp-theme="dark-water"] *::after {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
`;
