import {expect, test, type Locator, type Page} from '@playwright/test';

const appearances = ['plain', 'pencil', 'reset', 'deeper', 'surface-only'] as const;
const pencilSurfaces = new Set<string>(['pencil', 'deeper', 'surface-only']);
const pencilIndicators = new Set<string>(['pencil', 'deeper']);
const parentParts = ['check', 'mixed', 'radio', 'switch', 'icon'] as const;
const fieldParts = ['textarea', 'search'] as const;
const markParts = ['check', 'mixed', 'radio', 'switch'] as const;

const part = (page: Page, name: string, suffix: string): Locator => page.locator(`#${name}-${suffix}`);
const parentSurface = (page: Page, name: string, suffix: string): Locator => part(page, name, suffix).locator(':scope > [data-outline]');
const fieldSurface = (page: Page, name: string, suffix: string): Locator => part(page, name, suffix).locator('..');
const mask = (locator: Locator): Promise<string> => locator.evaluate(el => getComputedStyle(el).maskImage);
const surfaceMask = (locator: Locator): Promise<string> => locator.evaluate(el => getComputedStyle(el, '::after').maskImage);
const painted = (locator: Locator): Promise<boolean> => locator.evaluate(el => {
  const css = getComputedStyle(el, '::after');
  return css.content !== 'none' && css.maskImage !== 'none';
});

async function ready(page: Page): Promise<void> {
  await expect(page.locator('#components-contract')).toBeVisible();
  await page.waitForFunction(() => [...document.querySelectorAll('astro-island[component-url]')].every(el => !el.hasAttribute('ssr')));
  await page.evaluate(() => document.fonts.ready);
}

async function keyboardFocus(page: Page, locator: Locator): Promise<void> {
  await page.keyboard.press('Tab');
  await locator.focus();
  await expect(locator).toBeFocused();
  expect(await locator.evaluate(el => el.matches(':focus-visible'))).toBe(true);
}

async function outline(locator: Locator) {
  return locator.evaluate(el => {
    const css = getComputedStyle(el);
    return {style: css.outlineStyle, width: parseFloat(css.outlineWidth), color: css.outlineColor, offset: css.outlineOffset};
  });
}

async function dimensions(page: Page, name: string) {
  return part(page, name, 'group').locator('button, [data-outline], [data-indicator], textarea, input[data-surface-control]').evaluateAll(elements => elements.map(el => {
    const rect = el.getBoundingClientRect();
    const css = getComputedStyle(el);
    return {
      tag: el.tagName,
      shape: el.getAttribute('data-outline'),
      indicator: el.getAttribute('data-indicator'),
      width: rect.width,
      height: rect.height,
      border: [css.borderTopWidth, css.borderRightWidth, css.borderBottomWidth, css.borderLeftWidth],
      radius: css.borderRadius,
      padding: [css.paddingTop, css.paddingRight, css.paddingBottom, css.paddingLeft],
    };
  }));
}

async function expectSameDimensions(page: Page, name: string): Promise<void> {
  const expected = await dimensions(page, 'plain');
  const actual = await dimensions(page, name);
  expect(actual).toHaveLength(expected.length);
  for (const [index, {width, height, ...layout}] of actual.entries()) {
    const {width: expectedWidth, height: expectedHeight, ...expectedLayout} = expected[index]!;
    expect(layout, `${name} part ${index}: border, radius and padding`).toEqual(expectedLayout);
    // Firefox's rect subtraction varies by ~0.000015px at different document offsets.
    // Permit <0.0005px floating-point error, far below a browser layout unit or pixel.
    expect(width, `${name} part ${index}: width`).toBeCloseTo(expectedWidth, 3);
    expect(height, `${name} part ${index}: height`).toBeCloseTo(expectedHeight, 3);
  }
}

async function eventCounts(page: Page, name: string): Promise<Record<string, number>> {
  return JSON.parse(await part(page, name, 'events').innerText()) as Record<string, number>;
}

test.beforeEach(async ({page}) => {
  // Even a DOM-level docs preference must not override the explicit plain React boundary.
  await page.goto('/pencil-components-contract/?strokes=pencil');
  await ready(page);
});

test('all component surfaces follow the nearest provider, not a pencil DOM ancestor', async ({page}) => {
  for (const name of appearances) {
    const surfaces = part(page, name, 'group').locator('[data-outline]');
    expect(await surfaces.count()).toBeGreaterThan(15);
    for (const surface of await surfaces.all()) {
      if (pencilSurfaces.has(name)) await expect(surface).toHaveClass(/elanor-pencil-surface/);
      else await expect(surface).not.toHaveClass(/elanor-pencil-surface/);
      expect(await painted(surface)).toBe(pencilSurfaces.has(name));
    }
    for (const suffix of parentParts) await expect(parentSurface(page, name, suffix)).toHaveAttribute('data-outline-focus', 'parent');
    await expect(part(page, name, 'button')).toHaveAttribute('data-outline-focus', 'self');
    for (const suffix of fieldParts) {
      await expect(fieldSurface(page, name, suffix)).toHaveAttribute('data-outline-focus', 'control');
      await expect(part(page, name, suffix)).toHaveAttribute('data-surface-control', '');
    }
  }
  await expect(page.locator('#components-wrapper')).toHaveAttribute('data-outline-focus', 'none');
  await expect(page.locator('#components-contract [data-surface]')).toHaveCount(0);
});

test('default check, indeterminate dash and dots opt in independently of surfaces', async ({page}) => {
  for (const suffix of markParts) {
    const plainMask = await mask(part(page, 'plain', `${suffix}-mark`));
    const pencilMask = await mask(part(page, 'pencil', `${suffix}-mark`));
    expect(pencilMask).not.toBe('none');
    expect(pencilMask).not.toBe(plainMask);
    for (const name of appearances) {
      const indicator = part(page, name, `${suffix}-mark`);
      await expect(indicator).toHaveAttribute('data-indicator', suffix === 'check' || suffix === 'mixed' ? 'check' : 'dot');
      if (pencilIndicators.has(name)) await expect(indicator).toHaveClass(/elanor-pencil-indicator/);
      else await expect(indicator).not.toHaveClass(/elanor-pencil-indicator/);
      expect(await mask(indicator)).toBe(pencilIndicators.has(name) ? pencilMask : plainMask);
    }
  }
  for (const name of appearances) {
    await expect(part(page, name, 'mixed-mark')).toHaveAttribute('data-indeterminate', '');
    expect(await mask(part(page, name, 'mixed-mark'))).not.toBe(await mask(part(page, name, 'check-mark')));
  }
  // Surface-only providers reset the inherited indicator class rather than silently inheriting it.
  expect(await painted(parentSurface(page, 'surface-only', 'check'))).toBe(true);
  expect(await mask(part(page, 'surface-only', 'radio-mark'))).toBe('none');
});

test('custom checkbox, radio and switch content never receives indicator paint', async ({page}) => {
  for (const name of appearances) {
    for (const suffix of ['check', 'radio', 'switch']) {
      const indicator = part(page, name, `custom-${suffix}-mark`);
      await expect(indicator).not.toHaveAttribute('data-indicator');
      await expect(indicator).not.toHaveClass(/elanor-pencil-indicator/);
      expect(await mask(indicator)).toBe('none');
      const child = indicator.locator('[data-custom-mark]');
      await expect(child).toHaveText(suffix === 'check' ? 'C' : suffix === 'radio' ? 'R' : 'S');
      await expect(child).not.toHaveAttribute('class');
      await expect(child).not.toHaveAttribute('data-indicator');
      expect(await mask(child)).toBe('none');
    }
  }
});

test('element and callback indicator renders own their content without builtin mark classes or masks', async ({page}) => {
  for (const name of appearances) {
    for (const suffix of ['check', 'radio', 'switch']) {
      const customChildrenClasses = await part(page, name, `custom-${suffix}-mark`).getAttribute('class');
      for (const mode of ['element', 'callback']) {
        const indicator = part(page, name, `${mode}-${suffix}-mark`);
        await expect(indicator).toBeVisible();
        await expect(indicator).not.toHaveAttribute('data-indicator');
        await expect(indicator).not.toHaveClass(/elanor-pencil-indicator/);
        // Only the ordinary part class remains, just as with explicit custom children.
        expect(await indicator.getAttribute('class')).toBe(customChildrenClasses);
        expect(await mask(indicator)).toBe('none');
        const child = indicator.locator('[data-custom-mark]');
        await expect(child).toHaveText(mode === 'element' ? 'E' : 'C');
        await expect(child).not.toHaveAttribute('class');
        await expect(child).not.toHaveAttribute('data-indicator');
        expect(await mask(child)).toBe('none');
      }
    }
  }
});

test('className, style and ref customize default indicators without opting out of their glyph', async ({page}) => {
  for (const name of appearances) {
    for (const suffix of ['check', 'radio', 'switch']) {
      const indicator = part(page, name, `${suffix}-mark`);
      await expect(indicator).toHaveClass(/default-glyph-customization/);
      await expect(indicator).toHaveCSS('opacity', '0.75');
      await expect(indicator).toHaveAttribute('data-glyph-ref', 'yes');
      await expect(indicator).toHaveAttribute('data-indicator', suffix === 'check' ? 'check' : 'dot');
      if (pencilIndicators.has(name)) {
        await expect(indicator).toHaveClass(/elanor-pencil-indicator/);
        expect(await mask(indicator)).not.toBe('none');
      } else {
        await expect(indicator).not.toHaveClass(/elanor-pencil-indicator/);
        expect(await mask(indicator)).toBe(await mask(part(page, 'plain', `${suffix}-mark`)));
      }
    }
  }
});

test('self, parent and direct-control focus paint locally while plain resets retain ordinary rings', async ({page}) => {
  const wrapper = page.locator('#components-wrapper');
  const wrapperMask = await surfaceMask(wrapper);
  for (const name of ['plain', 'pencil', 'reset', 'deeper']) {
    const targets = [
      {control: part(page, name, 'button'), surface: part(page, name, 'button')},
      ...parentParts.map(suffix => ({control: part(page, name, suffix), surface: parentSurface(page, name, suffix)})),
      ...fieldParts.map(suffix => ({control: part(page, name, suffix), surface: fieldSurface(page, name, suffix)})),
    ];
    for (const {control, surface} of targets) {
      const restingMask = await surfaceMask(surface);
      const unrelated = parentSurface(page, name, 'disabled-check');
      const unrelatedMask = await surfaceMask(unrelated);
      await keyboardFocus(page, control);
      const focusedOutline = await outline(surface);
      if (pencilSurfaces.has(name)) {
        expect(focusedOutline.style).toBe('none');
        expect(await surfaceMask(surface)).not.toBe(restingMask);
        expect(await painted(surface)).toBe(true);
      } else {
        expect(focusedOutline.style).toBe('solid');
        expect(focusedOutline.width).toBeGreaterThan(0);
        expect(await painted(surface)).toBe(false);
      }
      expect(await surfaceMask(unrelated)).toBe(unrelatedMask);
      expect(await surfaceMask(wrapper)).toBe(wrapperMask);
    }
  }
});

test('a focused Search adornment does not trigger the native control focus mask', async ({page}) => {
  for (const name of ['pencil', 'deeper', 'surface-only']) {
    const surface = fieldSurface(page, name, 'search');
    const restingMask = await surfaceMask(surface);
    const restingOutline = await outline(surface);
    await keyboardFocus(page, part(page, name, 'search-action'));
    expect(await surfaceMask(surface)).toBe(restingMask);
    const focusedOutline = await outline(surface);
    expect(focusedOutline).toEqual(restingOutline);
    // WebKit reports the initial medium width (3px) even with outline-style: none.
    expect(focusedOutline.style).toBe('none');
    await keyboardFocus(page, part(page, name, 'search'));
    expect(await surfaceMask(surface)).not.toBe(restingMask);
  }
});

test('navigation lines keep ordinary focus inside a pencil wrapper and do not inherit suppression', async ({page}) => {
  for (const name of appearances) {
    const navigation = part(page, name, 'navigation');
    const restingMask = await surfaceMask(navigation);
    await keyboardFocus(page, navigation);
    expect((await outline(navigation)).style).toBe('solid');
    expect((await outline(navigation)).width).toBeGreaterThan(0);
    expect(await surfaceMask(navigation)).toBe(restingMask);
    const inherited = await navigation.evaluate(el => {
      const css = getComputedStyle(el);
      return ['--outline-plain-focus', '--outline-plain-border', '--mark-check', '--stroke-images'].map(property => css.getPropertyValue(property).trim());
    });
    expect(inherited).toEqual(['', '', '', '']);
  }
});

test('horizontal, vertical and table-edge lines retain their geometry and transparent last row', async ({page}) => {
  for (const name of appearances) {
    await expect(part(page, name, 'separator')).toHaveAttribute('data-outline', 'line');
    await expect(part(page, name, 'separator-vertical')).toHaveAttribute('data-outline', 'line-vertical');
    for (const suffix of ['navigation', 'table-head', 'table-first', 'table-last']) {
      await expect(part(page, name, suffix)).toHaveAttribute('data-outline-edge', 'block-end');
    }
    const horizontal = await part(page, name, 'separator').boundingBox();
    const vertical = await part(page, name, 'separator-vertical').boundingBox();
    expect(horizontal!.width).toBeGreaterThan(horizontal!.height);
    expect(vertical!.height).toBeGreaterThan(vertical!.width);
    if (pencilSurfaces.has(name)) {
      await expect(part(page, name, 'navigation')).toHaveCSS('box-shadow', 'none');
      for (const suffix of ['separator', 'separator-vertical', 'table-head', 'table-first']) {
        expect(await part(page, name, suffix).evaluate(el => getComputedStyle(el, '::after').backgroundColor)).not.toBe('rgba(0, 0, 0, 0)');
      }
      expect(await part(page, name, 'table-last').evaluate(el => getComputedStyle(el, '::after').backgroundColor)).toBe('rgba(0, 0, 0, 0)');
    }
  }
  for (const name of appearances.slice(1)) await expectSameDimensions(page, name);
});

for (const name of ['plain', 'pencil', 'reset']) {
  test(`${name} labels, keyboard changes and disabled controls retain their native contracts`, async ({page}) => {
    await expect(part(page, name, 'check')).toHaveAttribute('aria-checked', 'true');
    await part(page, name, 'check-label').click();
    await expect(part(page, name, 'check')).toHaveAttribute('aria-checked', 'false');
    await keyboardFocus(page, part(page, name, 'check'));
    await page.keyboard.press('Space');
    await expect(part(page, name, 'check')).toHaveAttribute('aria-checked', 'true');
    await part(page, name, 'radio-other-label').click();
    await expect(part(page, name, 'radio-other')).toHaveAttribute('aria-checked', 'true');
    await expect(part(page, name, 'radio')).toHaveAttribute('aria-checked', 'false');
    await part(page, name, 'switch-label').click();
    await expect(part(page, name, 'switch')).toHaveAttribute('aria-checked', 'false');
    await keyboardFocus(page, part(page, name, 'switch'));
    await page.keyboard.press('Space');
    await expect(part(page, name, 'switch')).toHaveAttribute('aria-checked', 'true');
    await part(page, name, 'icon').click();
    await part(page, name, 'textarea').fill('Edited notes');
    await part(page, name, 'search').fill('Edited query');
    await expect(part(page, name, 'textarea')).toHaveValue('Edited notes');
    await expect(part(page, name, 'search')).toHaveValue('Edited query');
    // Labels inherit their control's disabled state in Playwright's actionability check.
    // Send a real click anyway: native disabled behavior must reject it, not the harness.
    for (const suffix of ['check', 'radio', 'switch']) await part(page, name, `disabled-${suffix}-label`).click({force: true});
    for (const suffix of ['check', 'radio', 'switch', 'icon', 'textarea', 'search']) await expect(part(page, name, `disabled-${suffix}`)).toBeDisabled();
    await part(page, name, 'disabled-icon').click({force: true});
    await expect(part(page, name, 'disabled-check')).toHaveAttribute('aria-checked', 'true');
    await expect(part(page, name, 'disabled-switch')).toHaveAttribute('aria-checked', 'true');
    await expect(part(page, name, 'disabled-radio')).toHaveAttribute('aria-checked', 'false');
    await expect.poll(() => eventCounts(page, name)).toEqual({checkbox: 2, radio: 1, switch: 2, icon: 1, textarea: 1, search: 1, disabled: 0});
  });
}

test('invalid field colors remain local and match plain rendering', async ({page}) => {
  for (const suffix of fieldParts) {
    const color = (name: string, field: string) => fieldSurface(page, name, field).evaluate(el => getComputedStyle(el).getPropertyValue('--outline-color').trim());
    const invalid = await color('plain', `invalid-${suffix}`);
    expect(invalid).not.toBe(await color('plain', suffix));
    for (const name of appearances) {
      await expect(part(page, name, `invalid-${suffix}`)).toHaveAttribute('aria-invalid', 'true');
      expect(await color(name, `invalid-${suffix}`)).toBe(invalid);
    }
  }
});

test('forced colors retain ordinary border colors, mark masks and focus geometry', async ({page, browserName}) => {
  test.skip(browserName !== 'chromium', 'Forced-colors emulation is covered by Chromium.');
  await page.emulateMedia({forcedColors: 'active'});
  const border = (locator: Locator) => locator.evaluate(el => {
    const css = getComputedStyle(el);
    return {color: css.borderColor, width: css.borderWidth, radius: css.borderRadius};
  });
  for (const name of ['pencil', 'reset', 'deeper', 'surface-only']) {
    await expectSameDimensions(page, name);
    for (const suffix of markParts) expect(await mask(part(page, name, `${suffix}-mark`))).toBe(await mask(part(page, 'plain', `${suffix}-mark`)));
    for (const surface of await part(page, name, 'group').locator('[data-outline]').all()) expect(await painted(surface)).toBe(false);
  }
  for (const suffix of parentParts) {
    const plain = parentSurface(page, 'plain', suffix);
    const pencil = parentSurface(page, 'pencil', suffix);
    expect(await border(pencil)).toEqual(await border(plain));
    await keyboardFocus(page, part(page, 'plain', suffix));
    const nativeOutline = await outline(plain);
    await keyboardFocus(page, part(page, 'pencil', suffix));
    expect(await outline(pencil)).toEqual(nativeOutline);
    expect(nativeOutline.style).toBe('solid');
    expect(nativeOutline.width).toBeGreaterThan(0);
  }
  for (const suffix of fieldParts) {
    await keyboardFocus(page, part(page, 'plain', suffix));
    const nativeOutline = await outline(fieldSurface(page, 'plain', suffix));
    await keyboardFocus(page, part(page, 'pencil', suffix));
    expect(await outline(fieldSurface(page, 'pencil', suffix))).toEqual(nativeOutline);
  }
});

test.describe('coarse pointer', () => {
  test.use({hasTouch: true});

  test('pencil and plain preserve enlarged hit targets without enlarging their visual surfaces', async ({page}) => {
    expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
    for (const name of appearances.slice(1)) await expectSameDimensions(page, name);
    for (const name of appearances) {
      for (const suffix of ['check', 'radio', 'switch', 'icon']) {
        const target = await part(page, name, suffix).boundingBox();
        const surface = await parentSurface(page, name, suffix).boundingBox();
        expect(target!.height).toBeGreaterThan(surface!.height);
        expect(target!.width).toBeGreaterThan(surface!.width);
      }
    }
    await part(page, 'pencil', 'check-label').tap();
    await expect(part(page, 'pencil', 'check')).toHaveAttribute('aria-checked', 'false');
    // Bypass only Playwright's enabled guard so the browser receives the disabled-label tap.
    await part(page, 'pencil', 'disabled-check-label').tap({force: true});
    await expect(part(page, 'pencil', 'disabled-check')).toHaveAttribute('aria-checked', 'true');
    expect((await eventCounts(page, 'pencil')).disabled).toBe(0);
  });
});
