import {readFile} from 'node:fs/promises';
import path from 'node:path';

import stylelint from 'stylelint';
import {describe, expect, it} from 'vitest';

import plugin, {
  createStrictConfig,
  noHardcodedTokenValuesName,
  noNonTokenCustomPropertiesName,
  preferSemanticTokenName,
  tokenPropertyCompatibilityName,
} from '../../src/index.js';

const catalogue = path.resolve('../design-tokens/dist/radius/tokens.catalog.json');

async function lint(
  code: string,
  ruleName: string,
  options: Record<string, unknown> = {},
  codeFilename = '/consumer/src/component.module.css',
) {
  const result = await stylelint.lint({
    code,
    codeFilename,
    config: {
      plugins: plugin,
      rules: {[ruleName]: [true, {catalogue, ...options}]},
    },
  });
  return result.results[0]?.warnings ?? [];
}

describe('shared strict configuration', () => {
  it('loads all rules and accepts a valid CSS Module', async () => {
    const code = await readFile('tests/fixtures/valid.module.css', 'utf8');
    const result = await stylelint.lint({
      code,
      codeFilename: '/consumer/src/card.module.css',
      config: createStrictConfig({catalogue}),
    });
    expect(result.results[0]?.warnings).toHaveLength(0);
  });

  it('reports the failing plain-CSS fixture across focused rules', async () => {
    const code = await readFile('tests/fixtures/invalid.css', 'utf8');
    const result = await stylelint.lint({
      code,
      codeFilename: '/consumer/src/card.css',
      config: createStrictConfig({catalogue}),
    });
    const rules = new Set(result.results[0]?.warnings.map((warning) => warning.rule));
    expect(rules).toContain(noNonTokenCustomPropertiesName);
    expect(rules).toContain(noHardcodedTokenValuesName);
    expect(rules).toContain(tokenPropertyCompatibilityName);
  });

  it('excludes default and configured ignore files before Stylelint parses them', async () => {
    const config = createStrictConfig({catalogue, ignoreFiles: ['**/legacy/**']});
    expect(config.ignoreFiles).toEqual(
      expect.arrayContaining(['**/*.generated.css', '**/legacy/**']),
    );

    const result = await stylelint.lint({
      files: path.resolve('tests/fixtures/malformed.generated.css'),
      config,
    });
    expect(result.errored).toBe(false);
    expect(result.results[0]?.ignored).toBe(true);
    expect(result.results[0]?.warnings).toHaveLength(0);
  });
});

describe('generated catalogue', () => {
  it('contains every emitted CSS property', async () => {
    const [css, catalogueSource] = await Promise.all([
      readFile('../design-tokens/dist/radius/tokens.css', 'utf8'),
      readFile(catalogue, 'utf8'),
    ]);
    const data = JSON.parse(catalogueSource) as {
      tokens: Array<{
        cssVariable: string;
        type: string;
        tier: string;
        css: string;
      }>;
    };
    const emitted = new Set([...css.matchAll(/^\s*(--[\w-]+):/gm)].map((match) => match[1]));
    expect(new Set(data.tokens.map((token) => token.cssVariable))).toEqual(emitted);
    expect(data.tokens.every((token) => token.type && token.tier && token.css)).toBe(true);
  });
});

describe(noNonTokenCustomPropertiesName, () => {
  it('accepts catalogue variables in plain CSS and CSS Modules', async () => {
    const code = await readFile('tests/fixtures/valid.module.css', 'utf8');
    expect(await lint(code, noNonTokenCustomPropertiesName)).toHaveLength(0);
  });

  it('rejects declarations, nested var fallbacks, registrations, and supports conditions', async () => {
    const warnings = await lint(
      `
      @property --local-color { syntax: "<color>"; inherits: true; initial-value: red; }
      @supports (--supports-local: red) { .b { color: var(--semantic-color-text-primary); } }
      .a { --card-gap: 1rem; color: var(--missing, var(--also-missing, #fff)); }
    `,
      noNonTokenCustomPropertiesName,
    );
    expect(warnings.map((warning) => warning.text).join('\n')).toContain('--local-color');
    expect(warnings.map((warning) => warning.text).join('\n')).toContain('--supports-local');
    expect(warnings.map((warning) => warning.text).join('\n')).toContain('--card-gap');
    expect(warnings.map((warning) => warning.text).join('\n')).toContain('--also-missing');
    expect(warnings.every((warning) => warning.text.includes('radius'))).toBe(true);
  });

  it('rejects a real variable that is absent from the selected brand', async () => {
    const warnings = await lint(
      '.a { color: var(--semantic-color-text-primary); }',
      noNonTokenCustomPropertiesName,
      {catalogue: path.resolve('tests/fixtures/other-brand.catalog.json')},
    );
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.text).toContain('other-brand');
  });

  it('supports an explicit integration allowlist and foundation files', async () => {
    expect(
      await lint('.a { color: var(--third-party-accent); }', noNonTokenCustomPropertiesName, {
        allowCustomProperties: ['--third-party-*'],
      }),
    ).toHaveLength(0);
    expect(
      await lint(
        ':root { --foundation-local: red; }',
        noNonTokenCustomPropertiesName,
        {
          foundationFiles: ['**/foundation.css'],
        },
        '/consumer/styles/foundation.css',
      ),
    ).toHaveLength(0);
  });
});

describe(noHardcodedTokenValuesName, () => {
  it('finds literals in fallbacks, calc, gradients, shadows, colors, and fonts', async () => {
    const warnings = await lint(
      `
      .a {
        color: var(--semantic-color-text-primary, #fff);
        padding: calc(1rem + var(--semantic-dimension-space-padding-small));
        background: linear-gradient(oklch(50% 0.2 20), rgb(0 0 0));
        box-shadow: 0 2px 0.5rem #000;
        font-family: "Inter", sans-serif;
        font-weight: 700;
        opacity: 0.5;
      }
    `,
      noHardcodedTokenValuesName,
    );
    const text = warnings.map((warning) => warning.text).join('\n');
    for (const expected of ['#fff', '1rem', 'oklch', '2px', 'Inter', '700', '0.5'])
      expect(text).toContain(expected);
  });

  it('finds supported literals across additional layout properties', async () => {
    const warnings = await lint(
      `.a {
      outline-offset: 2px;
      scroll-margin-block: 1rem;
      grid-template-columns: minmax(16rem, 1fr);
      transform: translateX(2px) scale(1.1);
      flex-basis: 16rem;
      z-index: 10;
      aspect-ratio: 16 / 9;
    }`,
      noHardcodedTokenValuesName,
    );
    expect(warnings).toHaveLength(9);
    const text = warnings.map((warning) => warning.text).join('\n');
    for (const expected of ['2px', '1rem', '16rem', '1.1', '10']) expect(text).toContain(expected);
    expect(text).toContain('number value "16"');
    expect(text).toContain('number value "9"');
  });

  it('finds the correct literal categories in font shorthand', async () => {
    const warnings = await lint(
      `.a { font: 400 1rem/1.2 Inter, sans-serif; }`,
      noHardcodedTokenValuesName,
    );
    const text = warnings.map((warning) => warning.text).join('\n');
    expect(text).toContain('fontWeight value "400"');
    expect(text).toContain('dimension value "1rem"');
    expect(text).toContain('number value "1.2"');
    expect(text).toContain('fontFamily value "Inter"');
    expect(text).not.toContain('fontWeight value "1.2"');
  });

  it('preserves structural values, layout fractions, transparent, and unitless zero', async () => {
    expect(
      await lint(
        `.a { margin: 0 auto; width: 50%; grid-template-columns: 1fr 2fr; color: currentColor; background: transparent; border: 0 none; z-index: 0; }`,
        noHardcodedTokenValuesName,
      ),
    ).toHaveLength(0);
  });
});

describe(tokenPropertyCompatibilityName, () => {
  const padding = 'var(--semantic-dimension-space-padding-medium)';
  const border = 'var(--semantic-dimension-border-width-default)';
  const compensatedPadding = `calc(${padding} - ${border})`;

  it('accepts border compensation for padding and logical control padding', async () => {
    const result = await stylelint.lint({
      code: `.a {
        padding: ${compensatedPadding};
        padding-inline: calc(var(--semantic-dimension-space-control-padding-inline-small) - ${border});
        padding-block: calc(var(--semantic-dimension-space-control-padding-block-small) - ${border});
      }`,
      config: createStrictConfig({catalogue}),
    });
    expect(result.results[0]?.warnings).toHaveLength(0);
  });

  it('still rejects direct border padding, reversed subtraction, and wrong roles or types', async () => {
    const warnings = await lint(
      `.a {
      padding: ${border};
      padding-top: calc(${border} - ${padding});
      padding-inline: calc(${padding} - var(--semantic-dimension-radius-medium));
      padding-block: calc(${padding} - var(--semantic-color-text-primary));
    }`,
      tokenPropertyCompatibilityName,
    );
    expect(warnings).toHaveLength(4);
    expect(warnings.filter((warning) => warning.text.includes('wrong role'))).toHaveLength(3);
    expect(warnings[3]?.text).toContain('incompatible');
  });

  it('does not exempt other occurrences of a compensated border token', async () => {
    const warnings = await lint(
      `.a {
      padding: ${compensatedPadding} ${border};
    }`,
      tokenPropertyCompatibilityName,
    );
    expect(warnings).toHaveLength(1);
    expect(warnings[0]?.text).toContain('wrong role');
  });

  it('accepts compatible types and semantic roles in compound declarations', async () => {
    expect(
      await lint(
        `.a {
      color: var(--semantic-color-text-primary);
      background-color: var(--semantic-color-background-surface);
      border: var(--semantic-dimension-border-width-default) solid var(--semantic-color-border-primary);
      padding: var(--semantic-dimension-space-padding-medium);
    }`,
        tokenPropertyCompatibilityName,
      ),
    ).toHaveLength(0);
  });

  it('treats a semantic role prefix as matching its base token', async () => {
    expect(
      await lint(
        `.a {
      outline-color: var(--semantic-color-focus-ring);
      outline: var(--semantic-dimension-border-width-default) solid var(--semantic-color-focus-ring-negative);
    }`,
        tokenPropertyCompatibilityName,
      ),
    ).toHaveLength(0);
  });

  it('rejects wrong token types and semantic roles', async () => {
    const warnings = await lint(
      `.a {
      color: var(--semantic-dimension-space-gap-medium);
      background-color: var(--semantic-color-text-primary);
      padding: var(--semantic-dimension-radius-medium);
    }`,
      tokenPropertyCompatibilityName,
    );
    expect(warnings).toHaveLength(3);
    expect(warnings[0]?.text).toContain('incompatible');
    expect(warnings[1]?.text).toContain('wrong role');
  });
});

describe(preferSemanticTokenName, () => {
  it('rejects primitives in app files and allows configured foundation files', async () => {
    expect(
      await lint('.a { color: var(--primitive-color-black); }', preferSemanticTokenName),
    ).toHaveLength(1);
    expect(
      await lint(
        '.a { color: var(--primitive-color-black); }',
        preferSemanticTokenName,
        {
          foundationFiles: ['**/tokens.css'],
        },
        '/consumer/foundation/tokens.css',
      ),
    ).toHaveLength(0);
  });

  it('honors scoped disable comments with descriptions', async () => {
    const warnings = await lint(
      `.a {
      /* stylelint-disable-next-line design-tokens/prefer-semantic-token -- legacy integration */
      color: var(--primitive-color-black);
    }`,
      preferSemanticTokenName,
    );
    expect(warnings).toHaveLength(0);
  });
});
