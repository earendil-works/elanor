import {test, expect, type Locator} from '@playwright/test';

const decoration = (element: Locator) => element.evaluate((node) => {
  const style = getComputedStyle(node, '::after');
  return {mask: style.maskImage, size: style.maskSize, color: style.borderColor, background: style.backgroundColor, display: style.display};
});

test('SSR hydrates without errors, loads masks, and exposes six distinct variants', async ({page}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', (response) => { if (response.status() >= 400) errors.push(response.url()); });
  await page.goto('/brushes/');
  await page.locator('astro-island[component-export="BrushPreview"]:not([ssr])').waitFor();
  const buttons = page.getByRole('button', {name: 'Same button'});
  const masks = new Set<string>();
  for (let index = 0; index < 6; index++) {
    await expect(buttons.nth(index)).toHaveAttribute('data-brush-variant', String(index));
    const paint = await decoration(buttons.nth(index));
    expect(paint.mask).not.toBe('none');
    masks.add(paint.mask);
  }
  expect(masks.size).toBe(6);
  expect(errors).toEqual([]);
});

test('native solid paint is hidden, including input and small-control adapters', async ({page}) => {
  await page.goto('/brushes/');
  const probes = [
    page.getByTestId('stretch-button'),
    page.getByRole('textbox', {name: 'Project name', exact: true}),
    page.getByRole('textbox', {name: 'Notes', exact: true}),
    page.getByRole('searchbox').locator('..'),
    page.getByRole('combobox'),
  ];
  for (const probe of probes) {
    expect(await probe.evaluate((e) => getComputedStyle(e).borderImageSource)).toContain('linear-gradient');
  }
  for (const probe of [page.getByRole('checkbox'), page.getByRole('radio').first()]) {
    expect(await probe.evaluate((e) => getComputedStyle(e, '::before').borderImageSource)).toContain('linear-gradient');
  }
});

test('hover/pressed colors follow native border colors; geometry never rerolls', async ({page}) => {
  await page.goto('/brushes/');
  const primary = page.getByRole('button', {name: 'Primary', exact: true});
  const before = await decoration(primary);
  await primary.hover();
  const hovered = await decoration(primary);
  expect(hovered.color).not.toBe(before.color);
  expect(hovered.mask).toBe(before.mask);
  await page.mouse.down();
  const pressed = await decoration(primary);
  expect(pressed.color).not.toBe(hovered.color);
  expect(pressed.color).toBe(await primary.evaluate((e) => getComputedStyle(e).borderColor));
  await page.mouse.up();
  const stretch = page.getByTestId('stretch-button');
  const variant = await stretch.getAttribute('data-brush-variant');
  const mask = (await decoration(stretch)).mask;
  await stretch.click();
  await expect(stretch).toHaveText('Click count: 1');
  expect(await stretch.getAttribute('data-brush-variant')).toBe(variant);
  expect((await decoration(stretch)).mask).toBe(mask);
});

test('native refs, labels, input editing, focus, invalid and disabled behavior survive', async ({page}) => {
  await page.goto('/brushes/');
  const input = page.getByRole('textbox', {name: 'Project name', exact: true});
  await input.fill('Still a native input');
  await page.getByRole('button', {name: 'Focus input via ref'}).click();
  await expect(input).toBeFocused();
  await expect(input).toHaveValue('Still a native input');
  const invalid = page.getByRole('textbox', {name: 'Invalid input'});
  expect((await decoration(invalid.locator('..'))).background).not.toBe((await decoration(input.locator('..'))).background);
  await expect(page.getByRole('textbox', {name: 'Disabled input'})).toBeDisabled();
  await expect(page.getByRole('button', {name: 'Disabled', exact: true})).toBeDisabled();
  await page.getByRole('checkbox').check();
  await expect(page.getByRole('checkbox')).toBeChecked();
  await page.getByRole('switch').click();
  await expect(page.getByRole('switch')).toBeChecked();
  await page.getByRole('radio', {name: 'Ink', exact: true}).check();
  await expect(page.getByRole('radio', {name: 'Ink', exact: true})).toBeChecked();
});

for (const deviceScaleFactor of [1, 2]) {
  test(`fixed corner/thickness at DPR ${deviceScaleFactor}, fractional widths and zoom`, async ({browser}, info) => {
    const context = await browser.newContext({deviceScaleFactor, viewport: {width: 1500, height: 1100}});
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4322/brushes/');
    const button = page.getByTestId('stretch-button');
    const before = await decoration(button);
    for (const width of [140, 319.5, 680]) {
      await button.evaluate((e, width) => { e.parentElement!.style.width = `${width}px`; }, width);
      const after = await decoration(button);
      expect(after.size).toBe(before.size);
      expect(after.mask).toBe(before.mask);
      await button.evaluate((e) => { e.style.zoom = '1.25'; });
      expect((await decoration(button)).mask).toBe(before.mask);
      await button.evaluate((e) => { e.style.zoom = '1'; });
    }
    await info.attach(`outline-dpr-${deviceScaleFactor}`, {body: await button.screenshot(), contentType: 'image/png'});
    // Reconstruct the eight actual masks on a canvas and sample the joins.
    // This catches clipped/gapped joins without relying on font-dependent snapshots.
    const coverage = await button.evaluate(async (e, dpr) => {
      const urls = Array.from(getComputedStyle(e, '::after').maskImage.matchAll(/url\("([^"]+)"\)/g), (m) => m[1]);
      const images = await Promise.all(urls.map(async (url) => { const image = new Image(); image.src = url; await image.decode(); return image; }));
      const results: number[] = [];
      for (const width of [140, 319.5, 680]) {
        const height = 28, slice = 6;
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(width * dpr); canvas.height = height * dpr;
        const ctx = canvas.getContext('2d')!;
        ctx.scale(dpr, dpr);
        const rects = [[0, 0, slice, slice], [slice, 0, width - 2 * slice, slice], [width - slice, 0, slice, slice], [0, slice, slice, height - 2 * slice], [width - slice, slice, slice, height - 2 * slice], [0, height - slice, slice, slice], [slice, height - slice, width - 2 * slice, slice], [width - slice, height - slice, slice, slice]];
        images.forEach((image, index) => { const [x, y, w, h] = rects[index]; ctx.drawImage(image, x, y, w, h); });
        for (const join of [slice, width - slice]) {
          for (const dx of [-1, 0, 1]) {
            const pixels = ctx.getImageData(Math.floor(join * dpr) + dx, 0, 1, slice * dpr).data;
            let alpha = 0;
            for (let p = 3; p < pixels.length; p += 4) alpha += pixels[p] / 255;
            results.push(alpha / dpr);
          }
        }
      }
      return results;
    }, deviceScaleFactor);
    expect(coverage).toHaveLength(18);
    for (const alpha of coverage) { expect(alpha).toBeGreaterThan(0.5); expect(alpha).toBeLessThan(2.8); }
    await context.close();
  });
}

test('forced colors restores solid borders and unmasked lines', async ({page}) => {
  await page.emulateMedia({forcedColors: 'active'});
  await page.goto('/brushes/');
  const button = page.getByTestId('stretch-button');
  expect((await decoration(button)).display).toBe('none');
  expect(await button.evaluate((e) => getComputedStyle(e).borderImageSource)).toBe('none');
  const input = page.getByRole('textbox', {name: 'Project name', exact: true});
  expect(await input.evaluate((e) => getComputedStyle(e).borderImageSource)).toBe('none');
  const separators = page.getByRole('separator');
  expect(await separators.first().evaluate((e) => getComputedStyle(e).maskImage)).toBe('none');
});

test('dark theme, vertical strokes, RTL and server-only rendering', async ({page, browser}, info) => {
  await page.goto('/brushes/');
  await page.getByRole('button', {name: 'Switch to dark'}).click();
  await expect(page.locator('html')).toHaveAttribute('data-color-scheme', 'dark');
  const vertical = page.locator('[role="separator"][data-orientation="vertical"]').first();
  const horizontal = page.locator('[role="separator"][data-orientation="horizontal"]').first();
  const mask = (e: Element) => getComputedStyle(e).maskImage;
  expect(await vertical.evaluate(mask)).not.toBe(await horizontal.evaluate(mask));
  await info.attach('dark-rtl', {body: await page.screenshot({fullPage: true}), contentType: 'image/png'});
  const context = await browser.newContext({javaScriptEnabled: false});
  const staticPage = await context.newPage();
  await staticPage.goto('http://127.0.0.1:4322/brushes/');
  expect((await decoration(staticPage.getByTestId('stretch-button'))).mask).not.toBe('none');
  await context.close();
});
