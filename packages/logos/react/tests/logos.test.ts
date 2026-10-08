import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

import {createElement, type ComponentType, type SVGProps} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, test} from 'vitest';

type LogoProps = Omit<SVGProps<SVGSVGElement>, 'height'> & {
  lockup?: 'horizontal' | 'vertical';
  monochrome?: boolean;
  scheme?: 'auto' | 'light' | 'dark';
  height?: number | string;
};

const logosDirectory = resolve(import.meta.dirname, '../..');
const {EarendilLogo, PiLogo} = (await import(
  resolve(logosDirectory, 'react/dist/index.js')
)) as Record<'EarendilLogo' | 'PiLogo', ComponentType<LogoProps>>;
const paths = (markup: string) => [...markup.matchAll(/ d="([^"]+)"/g)].map((match) => match[1]);

describe('React logos', () => {
  test('render the same geometry and colors as the SVG files', async () => {
    const svg = await readFile(
      resolve(logosDirectory, 'dist/svg/earendil/earendil-logo-wordmark-horizontal-on-dark.svg'),
      'utf8',
    );
    const markup = renderToStaticMarkup(
      createElement(EarendilLogo, {lockup: 'horizontal', scheme: 'dark'}),
    );
    expect(paths(markup)).toEqual(paths(svg));
    expect([...markup.matchAll(/fill="(#[0-9a-f]+)"/g)].map((match) => match[1])).toEqual(
      [...svg.matchAll(/fill="(#[0-9a-f]+)"/g)].map((match) => match[1]),
    );
  });

  test('auto scheme uses light-dark() only where colors differ', () => {
    const markup = renderToStaticMarkup(createElement(PiLogo, {lockup: 'vertical'}));
    expect(markup).toContain('fill="#4d9abf"');
    expect(markup).toContain('fill:light-dark(#6e6e6e, #f6f6f6)');
  });

  test('monochrome uses the dedicated monochrome drawing', async () => {
    const svg = await readFile(
      resolve(logosDirectory, 'dist/svg/pi/pi-logo-monochrome-on-light.svg'),
      'utf8',
    );
    const markup = renderToStaticMarkup(createElement(PiLogo, {monochrome: true, scheme: 'light'}));
    expect(paths(markup)).toEqual(paths(svg));
  });

  test('sizes by height and labels the brand', () => {
    const markup = renderToStaticMarkup(createElement(EarendilLogo, {height: 42}));
    expect(markup).toContain('height="42"');
    expect(markup).toContain('width="28"');
    expect(markup).toContain('role="img"');
    expect(markup).toContain('aria-label="Earendil"');

    const decorative = renderToStaticMarkup(
      createElement(PiLogo, {'aria-hidden': true, height: '2rem'}),
    );
    expect(decorative).not.toContain('role=');
    expect(decorative).toContain('aspect-ratio:560 / 560');
  });
});
