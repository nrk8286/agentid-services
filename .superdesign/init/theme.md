# Theme

## Compact token summary

- Color scheme: dark only.
- Backgrounds: `--bg #050b14`, `--bg-alt #07111d`, layered blue radial gradients.
- Surfaces: `--surface rgba(8,18,31,.86)`, `--surface-2 rgba(13,26,43,.92)`.
- Text: `--text #eef6ff`, `--muted #9cb3cc`, `--muted-2 #7f96b3`.
- Brand accents: cyan `--accent #71d6ff`, blue `--accent-2 #5da0ff`.
- Semantic: success `#6df0c6`, warning `#f3c46f`, danger `#ff7e8d`.
- Lines: `rgba(127,205,255,.16)` and strong `.28`.
- Font: Segoe UI Variable, Avenir Next, Helvetica Neue, Arial, sans-serif.
- Radius: 12, 16, 20, and 28px. Pill controls use 999px.
- Shadow: `0 24px 80px rgba(0,0,0,.38)`.
- Content width: 1180px; main gutter 16px; sections use 24–32px gaps.
- Motion: 180ms hover transitions; scroll behavior smooth; reduced-motion media rule in source styles.
- Responsive behavior: nav wraps/collapses and grids move to one column on tablet/mobile breakpoints.

## Raw token source

Source: `src/agentid-site.js`, `STYLES` template literal.

```css
:root {
  color-scheme: dark;
  --bg: #050b14;
  --bg-alt: #07111d;
  --surface: rgba(8, 18, 31, 0.86);
  --surface-2: rgba(13, 26, 43, 0.92);
  --line: rgba(127, 205, 255, 0.16);
  --line-strong: rgba(127, 205, 255, 0.28);
  --text: #eef6ff;
  --muted: #9cb3cc;
  --muted-2: #7f96b3;
  --accent: #71d6ff;
  --accent-2: #5da0ff;
  --success: #6df0c6;
  --warning: #f3c46f;
  --danger: #ff7e8d;
  --shadow: 0 24px 80px rgba(0, 0, 0, 0.38);
  --radius-xl: 28px;
  --radius-lg: 20px;
  --radius-md: 16px;
  --radius-sm: 12px;
  --content-width: 1180px;
  font-family: "Segoe UI Variable", "Avenir Next", "Helvetica Neue", Arial, sans-serif;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  min-height: 100vh;
  color: var(--text);
  background:
    radial-gradient(circle at top left, rgba(97, 168, 255, 0.18), transparent 36%),
    radial-gradient(circle at 85% 10%, rgba(88, 217, 255, 0.14), transparent 24%),
    radial-gradient(circle at 50% 0%, rgba(50, 93, 190, 0.16), transparent 40%),
    linear-gradient(180deg, #040914 0%, #060d18 40%, #050b14 100%);
  font-size: 16px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
main {
  width: min(var(--content-width), calc(100% - 32px));
  margin: 0 auto;
  padding: 28px 0 80px;
  position: relative;
  z-index: 1;
}
```

There is no Tailwind config, CSS module, theme provider, or external component library. The complete raw stylesheet is the `STYLES` template literal beginning at line 8816 of `src/agentid-site.js`; design calls should use `src/agentid-site.js:8817:8840` for exact tokens and add only the relevant selector ranges because the file is over the 900-line context threshold.
