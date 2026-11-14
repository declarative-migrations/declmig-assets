import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const css = readFileSync(new URL('../branding/tokens.css', import.meta.url), 'utf8');

function declarations(selector) {
  const index = css.indexOf(selector + ' {');
  assert.notEqual(index, -1, 'missing selector: ' + selector);
  const body = css.slice(index + selector.length + 2).split('}')[0];
  return Object.fromEntries([...body.matchAll(/(--declmig-[a-z0-9-]+):\s*([^;]+);/g)].map(match => [match[1], match[2].trim()]));
}

function relativeLuminance(hex) {
  const rgb = hex.match(/^#([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i);
  assert.ok(rgb, 'not a 6-digit hex color: ' + hex);
  const values = rgb.slice(1).map(v => parseInt(v, 16) / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
}

function contrast(a, b) {
  const lumA = relativeLuminance(a), lumB = relativeLuminance(b);
  return (Math.max(lumA, lumB) + 0.05) / (Math.min(lumA, lumB) + 0.05);
}

test('light and both dark modes share the same semantic colors', () => {
  const light = declarations(':root');
  const dark = declarations(':root[data-declmig-theme="dark"]');
  const systemDark = declarations(':root:not([data-declmig-theme="light"]):not([data-declmig-theme="dark"])');
  const colors = Object.keys(light).filter(key => key.startsWith('--declmig-color-'));
  assert.ok(colors.length >= 10);
  for (const key of colors) {
    assert.ok(dark[key], 'dark theme missing ' + key);
    assert.equal(systemDark[key], dark[key], 'system dark theme drift: ' + key);
  }
});

test('light and dark text and button colors meet WCAG AA normal-text contrast', () => {
  for (const selector of [':root', ':root[data-declmig-theme="dark"]']) {
    const tokens = declarations(selector);
    for (const [foreground, background] of [
      ['--declmig-color-text', '--declmig-color-surface'],
      ['--declmig-color-muted', '--declmig-color-surface'],
      ['--declmig-color-primary-on', '--declmig-color-primary'],
    ]) {
      const ratio = contrast(tokens[foreground], tokens[background]);
      assert.ok(ratio >= 4.5, selector + ' ' + foreground + ' failed contrast: ' + ratio);
    }
  }
});

test('shared spacing and radii use finite rem units', () => {
  const tokens = declarations(':root');
  for (const [name, value] of Object.entries(tokens)) {
    if (!name.startsWith('--declmig-space-') && !name.startsWith('--declmig-radius-')) continue;
    assert.match(value, /^\d+(?:\.\d+)?rem$/, name + ' invalid length');
  }
});
