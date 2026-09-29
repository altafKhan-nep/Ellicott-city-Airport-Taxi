/**
 * Contrast guard for the Cargo-derived palette in `src/index.css`.
 *
 * The theme supplies literal colours, several of which FAIL WCAG AA when used
 * as text (Cargo's #00D084 green is 1.9:1 on a light tint; its #727272 gray is
 * 4.49:1). We therefore keep Cargo's hue identity but re-tune lightness per
 * role. This script asserts every combination the UI actually renders, so a
 * future colour tweak cannot quietly regress accessibility.
 *
 * Run: node scripts/check-contrast.mjs
 * Add to CI/pre-commit if the palette is ever changed again.
 */

// Must mirror the @theme block in src/index.css.
const T = {
  brand: {
    50: '#fdeeee', 100: '#fbdada', 200: '#f5b3b3', 300: '#ee8a8a', 400: '#e05050',
    500: '#d62f2f', 600: '#c22020', 700: '#a81c1c', 800: '#8a1a1a', 900: '#6b1515', 950: '#451010',
  },
  accent: {
    50: '#f7f7f8', 100: '#eeeeef', 200: '#dedee2', 300: '#c4c4c9', 400: '#9a9aa2',
    500: '#6b6b6b', 600: '#5b5b5b', 700: '#444444', 800: '#313131', 900: '#1c1c1c',
  },
  // Token name is "gold" for backwards compatibility; values are Cargo orange.
  gold: {
    50: '#fff0e5', 100: '#ffddc7', 200: '#ffbc8f', 300: '#ffa970', 400: '#ff9147',
    500: '#ff751a', 600: '#c95000', 700: '#bc4c00', 800: '#9e3f00', 900: '#803300', 950: '#522100',
  },
  success: {
    50: '#e6fbf3', 100: '#c2f5e1', 200: '#86eac5', 300: '#4ddca8', 400: '#1fd08e',
    500: '#00d084', 600: '#008252', 700: '#006b43', 800: '#045233', 900: '#032b21', 950: '#01170f',
  },
  surface: '#ffffff',
  ink: '#1c1c1c',
  muted: '#6b6b6b',
  paper: '#f7f7f8',
};

const DARK = { surface: '#313131', paper: '#1c1c1c', ink: '#f7f7f8', muted: '#9a9aa2' };

const hex = (h) => {
  const s = h.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
};

const luminance = (rgb) => {
  const f = (v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
};

const ratio = (a, b) => {
  const [hi, lo] = [luminance(hex(a)), luminance(hex(b))].sort((m, n) => n - m);
  return (hi + 0.05) / (lo + 0.05);
};

const get = (name, mode) => {
  const [scale, step] = name.split('-');
  if (step && T[scale]) return T[scale][step];
  if (mode === 'dark' && DARK[name]) return DARK[name];
  if (T[name]) return T[name];
  throw new Error(`Unknown token: ${name}`);
};

// Composite a translucent foreground (e.g. text-white/75) over its backdrop.
const composite = (whiteAlpha, bg) => {
  const a = whiteAlpha;
  const w = hex('#ffffff');
  const b = hex(bg);
  return `#${b.map((v, i) => Math.round(w[i] * a + v * (1 - a)).toString(16).padStart(2, '0')).join('')}`;
};

// [label, foreground, background, minimum]
const LIGHT = [
  ['white text on red band (nav/hero/footer)', '#ffffff', 'brand-800', 4.5],
  ['gold-300 accent word on red band', 'gold-300', 'brand-800', 4.5],
  ['gold-400 live dot on red band (graphic)', 'gold-400', 'brand-800', 3],
  ['gold-300 on brand-900 (band mid)', 'gold-300', 'brand-900', 4.5],
  ['gold-300 on brand-950 (band deep)', 'gold-300', 'brand-950', 4.5],
  ['brand-700 text on surface (links, CTA)', 'brand-700', 'surface', 4.5],
  ['brand-600 text on surface', 'brand-600', 'surface', 4.5],
  ['brand-500 text on paper', 'brand-500', 'paper', 4.5],
  ['ink body on paper', 'ink', 'paper', 4.5],
  ['ink body on surface', 'ink', 'surface', 4.5],
  ['muted secondary on paper', 'muted', 'paper', 4.5],
  ['muted secondary on surface', 'muted', 'surface', 4.5],
  ['accent-500 on paper', 'accent-500', 'paper', 4.5],
  ['accent-700 heading on paper', 'accent-700', 'paper', 4.5],
  ['gold-600 text on surface (orange on white)', 'gold-600', 'surface', 4.5],
  ['gold-700 on gold-50 chip', 'gold-700', 'gold-50', 4.5],
  ['brand-600 on brand-50 (soft wash)', 'brand-600', 'brand-50', 4.5],
  ['success-600 on success-50 (status pill)', 'success-600', 'success-50', 4.5],
  ['success-700 on success-100', 'success-700', 'success-100', 4.5],
  ['accent-200 card border on surface (non-text)', 'accent-200', 'surface', 1.3],
];

const DARK_PAIRS = [
  ['ink on paper', 'ink', 'paper', 4.5],
  ['muted on paper', 'muted', 'paper', 4.5],
  ['ink on surface', 'ink', 'surface', 4.5],
  ['muted on surface', 'muted', 'surface', 4.5],
  ['brand-300 readable red on surface', 'brand-300', 'surface', 4.5],
  ['gold-400 orange on surface', 'gold-400', 'surface', 4.5],
  ['accent-400 muted on paper', 'accent-400', 'paper', 4.5],
];

let failures = 0;
const run = (title, pairs, mode) => {
  console.log(`\n=== ${title} ===`);
  for (const [label, fg, bg, need] of pairs) {
    const bgHex = mode === 'dark' && DARK[bg] ? DARK[bg] : get(bg, mode);
    const fgHex = fg.startsWith('#') ? fg : get(fg, mode);
    const r = ratio(fgHex, bgHex);
    const pass = r >= need;
    if (!pass) failures += 1;
    console.log(`  ${pass ? 'ok  ' : 'FAIL'} ${r.toFixed(2).padStart(5)}:1  (min ${need})  ${label}`);
  }
};

run('LIGHT MODE', LIGHT, 'light');
run('DARK MODE', DARK_PAIRS, 'dark');

console.log('\n=== TRANSLUCENT NAV TEXT ON THE RED BAND ===');
for (const alpha of [0.75, 0.8, 0.9, 1]) {
  const bgHex = T.brand[800];
  const c = composite(alpha, bgHex);
  const r = ratio(c, bgHex);
  const pass = r >= 4.5;
  if (!pass) failures += 1;
  console.log(`  ${pass ? 'ok  ' : 'FAIL'} ${r.toFixed(2).padStart(5)}:1  white/${alpha * 100} on brand-800`);
}

console.log(`\n${failures === 0 ? 'ALL PAIRS PASS WCAG AA' : `${failures} FAILING PAIR(S)`}`);
process.exit(failures ? 1 : 0);
