import {existsSync, readdirSync} from 'node:fs';
import {expect, test, type Locator, type Page} from '@playwright/test';

const painted = (locator: Locator) => locator.evaluate(el => {
  const css = getComputedStyle(el, '::after');
  return css.content !== 'none' && css.maskImage !== 'none';
});

async function ready(page: Page): Promise<void> {
  await page.waitForFunction(() => [...document.querySelectorAll('astro-island[component-url]')].every(el => !el.hasAttribute('ssr')));
  await page.evaluate(() => document.fonts.ready);
}

async function keyboardFocus(page: Page, id: string): Promise<void> {
  // Tab establishes keyboard modality; focus() then targets the specified supported part.
  await page.keyboard.press('Tab');
  await page.locator(id).focus();
  await expect(page.locator(id)).toBeFocused();
  expect(await page.locator(id).evaluate(el => el.matches(':focus-visible'))).toBe(true);
}

test.beforeEach(async ({page}) => {
  await page.goto('/pencil-contract/?strokes=plain');
  await ready(page);
});

test('nearest React appearance boundary wins without a DOM wrapper', async ({page}) => {
  expect(await painted(page.locator('#pencil-button'))).toBe(true);
  expect(await painted(page.locator('#plain-button'))).toBe(false);
  expect(await painted(page.locator('#pencil-again'))).toBe(true);
  await expect(page.locator('#consumer-button')).toHaveClass(/consumer-skin/);
  expect(await painted(page.locator('#consumer-button'))).toBe(false);
  await expect(page.locator('#pencil-button')).toHaveClass(/enabled-test/);
});

test('nested plain controls keep keyboard focus and do not inherit paint switches', async ({page}) => {
  for (const id of ['#plain-button', '#wrapper-plain-child']) {
    await keyboardFocus(page, id);
    const outline = await page.locator(id).evaluate(el => {
      const css = getComputedStyle(el);
      return {width: parseFloat(css.outlineWidth), style: css.outlineStyle, inherited: css.getPropertyValue('--outline-plain-focus')};
    });
    expect(outline.width).toBeGreaterThan(0);
    expect(outline.style).toBe('solid');
    expect(outline.inherited).toBe('');
  }
  expect(await painted(page.locator('#wrapper'))).toBe(true);
  expect(await painted(page.locator('#wrapper-plain-child'))).toBe(false);
});

test('paint survives element and callback render composition', async ({page}) => {
  await expect(page.locator('#element-render')).toHaveText('Custom element children');
  await expect(page.locator('#callback-render')).toHaveText('Callback children');
  expect(await painted(page.locator('#element-render'))).toBe(true);
  expect(await painted(page.locator('#callback-render'))).toBe(true);
});

test('input frame and native control retain separate customization and refs', async ({page}) => {
  await expect(page.locator('#custom-input')).toHaveAttribute('data-input-ref', 'yes');
  await expect(page.locator('#custom-frame')).toHaveAttribute('data-frame-ref', 'yes');
  await expect(page.locator('#custom-input')).toHaveClass(/custom-control/);
  await expect(page.locator('#custom-frame')).toHaveClass(/custom-frame/);
  await expect(page.locator('#custom-frame')).toHaveCSS('width', '192px');
  await page.getByLabel('Custom input', {exact: true}).fill('Edited');
  await expect(page.getByLabel('Custom input', {exact: true})).toHaveValue('Edited');
  await expect(page.getByLabel('Change count')).not.toHaveText('0');
  expect(await painted(page.locator('#custom-frame'))).toBe(true);
});

for (const name of ['pencil', 'plain', 'custom-container']) {
  test(`${name} popup retains appearance across its portal and customization of scrolling content`, async ({page}) => {
    await page.getByRole('button', {name: `Open ${name}`, exact: true}).click();
    const popup = page.locator(`#${name}-popup`);
    await expect(popup).toBeVisible();
    // Base UI autofocus can scroll the body after it first becomes visible (notably WebKit).
    await expect(page.getByLabel(`${name} field`, {exact: true})).toBeFocused();
    expect(await painted(popup)).toBe(name !== 'plain');
    expect(await popup.evaluate(el => Boolean(el.closest('[data-docs-swap="content"]')))).toBe(name === 'custom-container');
    if (name === 'custom-container') await expect(page.locator('#portal-host').locator(`#${name}-popup`)).toBeVisible();
    const content = page.locator(`#${name}-body`);
    await expect(content).toHaveAttribute('data-surface-content', '');
    await content.evaluate(async el => {
      el.style.maxHeight = '120px';
      const paragraph = document.createElement('p'); paragraph.textContent = 'Long content '.repeat(500); el.append(paragraph);
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      el.scrollTop = el.scrollHeight;
    });
    expect(await content.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
    // Popup itself is never focus-painted when a child input receives focus.
    const paintColor = await popup.evaluate(el => getComputedStyle(el, '::after').backgroundColor);
    await page.getByLabel(`${name} field`, {exact: true}).focus();
    expect(await popup.evaluate(el => getComputedStyle(el, '::after').backgroundColor)).toBe(paintColor);
    await page.keyboard.press('Escape');
    await expect(popup).not.toBeVisible();
    await expect(page.getByRole('button', {name: `Open ${name}`, exact: true})).toBeFocused();
  });
}

test('appearance switching preserves button and frame dimensions', async ({page}) => {
  await page.goto('/pencil-pilot/?strokes=plain'); await ready(page);
  const rectangles = () => page.locator('[data-outline]').evaluateAll(els => els.map(el => {
    const r = el.getBoundingClientRect(); return {x: r.x, y: r.y, width: r.width, height: r.height};
  }));
  const before = await rectangles();
  await page.evaluate(() => {document.documentElement.dataset.strokes = 'pencil';});
  await expect(page.locator('[data-testid="buttons"] button').first()).toHaveClass(/elanor-pencil-surface/);
  expect(await rectangles()).toEqual(before);
  await page.evaluate(() => {delete document.documentElement.dataset.strokes;});
  await expect(page.locator('[data-testid="buttons"] button').first()).not.toHaveClass(/elanor-pencil-surface/);
  expect(await rectangles()).toEqual(before);
});

test('forced colors use ordinary borders and visible native focus', async ({page, browserName}) => {
  test.skip(browserName !== 'chromium', 'Forced-colors emulation is verified separately for other platforms.');
  await page.emulateMedia({forcedColors: 'active'});
  await keyboardFocus(page, '#pencil-button');
  expect(await painted(page.locator('#pencil-button'))).toBe(false);
  expect(await page.locator('#pencil-button').evaluate(el => parseFloat(getComputedStyle(el).outlineWidth))).toBeGreaterThan(0);
  await keyboardFocus(page, '#custom-input');
  expect(await painted(page.locator('#custom-frame'))).toBe(false);
  expect(await page.locator('#custom-frame').evaluate(el => parseFloat(getComputedStyle(el).outlineWidth))).toBeGreaterThan(0);
});

test('unsupported shapes stay plain rather than producing an unmasked overlay', async ({page}) => {
  expect(await painted(page.locator('#unsupported-shape'))).toBe(false);
  expect(await page.locator('#unsupported-shape').evaluate(el => getComputedStyle(el, '::after').content)).toBe('none');
  await keyboardFocus(page, '#unsupported-shape');
  expect(await page.locator('#unsupported-shape').evaluate(el => parseFloat(getComputedStyle(el).outlineWidth))).toBeGreaterThan(0);
});

test('pencil positioning does not override consumer layout', async ({page}) => {
  await page.addStyleTag({content: '.consumer-position { position: absolute; inset: 30px auto auto 400px; }'});
  await page.locator('#pencil-button').evaluate(el => el.classList.add('consumer-position'));
  await expect(page.locator('#pencil-button')).toHaveCSS('position', 'absolute');
  const before = await page.locator('#pencil-button').boundingBox();
  await page.locator('#pencil-button').evaluate(el => el.classList.remove('elanor-pencil-surface'));
  await expect(page.locator('#pencil-button')).toHaveCSS('position', 'absolute');
  expect(await page.locator('#pencil-button').boundingBox()).toEqual(before);
});

test('pencil focus uses the focus mask without a second solid ring', async ({page}) => {
  for (const [control, surface] of [['#pencil-button', '#pencil-button'], ['#custom-input', '#custom-frame']]) {
    const restingMask = await page.locator(surface!).evaluate(el => getComputedStyle(el, '::after').maskImage);
    await keyboardFocus(page, control!);
    expect(await painted(page.locator(surface!))).toBe(true);
    const focused = await page.locator(surface!).evaluate(el => {
      return {outline: getComputedStyle(el).outlineStyle, mask: getComputedStyle(el, '::after').maskImage};
    });
    expect(focused.outline).toBe('none');
    expect(focused.mask).not.toBe(restingMask);
  }
});

test('actual Tab traversal follows the native control order', async ({page}) => {
  await page.locator('[data-docs-swap="content"]').evaluate(el => {el.tabIndex = -1; el.focus();});
  for (const id of ['#pencil-button', '#element-render', '#callback-render']) {
    await page.keyboard.press('Tab');
    await expect(page.locator(id)).toBeFocused();
  }
});

const source = new URL('../../../packages/react/src/', import.meta.url);
const components = readdirSync(source).filter(name => existsSync(new URL(`${name}/${name}.mdx`, source)));

for (const component of components) {
  test(`docs ${component} shares the provider with its migrated controls`, async ({page}) => {
    await page.goto(`/components/${component}/?strokes=pencil`); await ready(page);
    const surfaces = page.locator('[data-docs-swap="content"] [data-outline]');
    // Typography/layout primitives need no decorative surface of their own.
    await expect(page.locator('[data-docs-swap="content"] [data-surface]')).toHaveCount(0);
    for (const surface of await surfaces.all()) {
      await expect(surface).toHaveClass(/elanor-pencil-surface/);
      expect(await painted(surface)).toBe(true);
    }
    for (const indicator of await page.locator('[data-docs-swap="content"] [data-indicator]').all()) {
      await expect(indicator).toHaveClass(/elanor-pencil-indicator/);
      expect(await indicator.evaluate(el => getComputedStyle(el).maskImage)).not.toBe('none');
    }
    expect(await page.evaluate(() => [...document.styleSheets].some(sheet => sheet.href?.includes('radius.scoped.css')))).toBe(false);
  });
}
