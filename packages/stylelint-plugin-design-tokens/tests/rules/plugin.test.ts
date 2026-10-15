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
  transitionTypeCompatibilityName,
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
        `.a { margin: 0 auto; width: 50%; grid-template-columns: 1fr 2fr; color: currentColor; background: transparent; border: 0 none; z-index: 0; scale: 0; }`,
        noHardcodedTokenValuesName,
      ),
    ).toHaveLength(0);
  });
  it('finds literal durations, easings, and the ends of fades and scales', async () => {
    const warnings = await lint(
      `.a {
      transition: opacity 150ms ease-out, transform 0.3s cubic-bezier(0.2, 0, 0, 1);
      transition-delay: 0s;
      animation-timing-function: linear(0, 1);
      opacity: 0;
      scale: 1;
      translate: 4px 0;
    }`,
      noHardcodedTokenValuesName,
    );
    const text = warnings.map((warning) => warning.text).join('\n');
    for (const expected of [
      'duration value "150ms"',
      'cubicBezier value "ease-out"',
      'duration value "0.3s"',
      'cubicBezier value "cubic-bezier(0.2, 0, 0, 1)"',
      'duration value "0s"',
      'cubicBezier value "linear(0, 1)"',
      'number value "0"',
      'number value "1"',
      'dimension value "4px"',
    ])
      expect(text).toContain(expected);
    expect(warnings).toHaveLength(9);
  });

  it('accepts transition tokens, step easings, and transition: none', async () => {
    expect(
      await lint(
        `.a {
        transition: opacity var(--semantic-transition-fade), transform var(--semantic-transition-movement-popup);
        transition-timing-function: steps(4), step-end;
        animation: none;
      }
      .b { transition: none; }`,
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

describe(`${tokenPropertyCompatibilityName} for spacing, sizes, and shadows`, () => {
  it('accepts spacing and sizes in margins, sizes with spacing in calc(), and border-like shadows', async () => {
    expect(
      await lint(
        `.a {
        margin-block: var(--semantic-dimension-space-gap-small) calc((var(--semantic-dimension-size-small) - 1lh) / 2);
        inline-size: calc(var(--semantic-dimension-size-x-small) - 2 * var(--semantic-dimension-space-padding-xx-small));
        max-block-size: calc(100dvh - 2 * var(--semantic-dimension-space-padding-medium));
        block-size: var(--semantic-dimension-border-width-small);
        max-inline-size: min(var(--semantic-dimension-size-max-width-modal), 100%);
        box-shadow: inset 0 0 0 var(--semantic-dimension-border-width-default) var(--semantic-color-border-primary), var(--semantic-shadow-popup);
      }`,
        tokenPropertyCompatibilityName,
      ),
    ).toHaveLength(0);
  });

  it('rejects radii in margins, spacing and breakpoints as sizes, and spacing in shadows', async () => {
    const warnings = await lint(
      `.a {
      margin: var(--semantic-dimension-radius-default);
      inline-size: var(--semantic-dimension-space-gap-small);
      max-inline-size: min(var(--semantic-dimension-breakpoint-small), 100%);
      box-shadow: 0 0 var(--semantic-dimension-space-gap-small) var(--semantic-color-border-primary);
    }`,
      tokenPropertyCompatibilityName,
    );
    const text = warnings.map((warning) => warning.text).join('\n');
    expect(text).toContain('wrong role for "margin"');
    expect(text).toContain('wrong role for "inline-size"');
    expect(text).toContain('wrong role for "max-inline-size"');
    expect(text).toContain('wrong role for "box-shadow"');
    expect(warnings).toHaveLength(4);
  });

  it('accepts maximum inline sizes only as maximums or as the cap in min()', async () => {
    expect(
      await lint(
        `.a {
        max-inline-size: calc(var(--semantic-dimension-size-max-width-content-large) + 2 * var(--semantic-dimension-space-padding-x-large));
        inline-size: min(var(--semantic-dimension-size-max-width-modal), 100%);
        max-width: var(--semantic-dimension-size-max-width-content-small);
      }`,
        tokenPropertyCompatibilityName,
      ),
    ).toHaveLength(0);
    const warnings = await lint(
      `.a {
      inline-size: var(--semantic-dimension-size-max-width-content-small);
      block-size: var(--semantic-dimension-size-max-width-content-small);
      max-block-size: var(--semantic-dimension-size-max-width-drawer);
    }`,
      tokenPropertyCompatibilityName,
    );
    expect(warnings.map((warning) => warning.text).join('\n')).toContain(
      'is a maximum inline size',
    );
    expect(warnings).toHaveLength(3);
  });

  it('lets a configured size role replace the calc() exception', async () => {
    const warnings = await lint(
      `.a { inline-size: calc(var(--semantic-dimension-size-small) - var(--semantic-dimension-space-gap-small)); }`,
      tokenPropertyCompatibilityName,
      {semanticRoles: {'inline-size': ['semantic.dimension.size.']}},
    );
    expect(warnings).toHaveLength(1);
  });
});

describe(`${tokenPropertyCompatibilityName} for motion`, () => {
  it('accepts transition tokens and their parts, scales, and travel', async () => {
    expect(
      await lint(
        `.a {
        transition: transform var(--semantic-transition-movement-popup);
        transition-duration: calc(2 * var(--semantic-transition-movement-drawer-duration));
        transition-timing-function: var(--semantic-transition-fade-timing-function);
        scale: var(--semantic-number-scale-popup);
        translate: 0 calc(-1 * var(--semantic-dimension-travel-popup));
        transform: translateY(calc(var(--semantic-dimension-travel-popup) * (var(--semantic-number-scale-rest) - 0.5))) scale(var(--semantic-number-scale-rest));
      }`,
        tokenPropertyCompatibilityName,
      ),
    ).toHaveLength(0);
  });

  it('lets a configured transform role replace the roles inside transform functions', async () => {
    expect(
      await lint(
        `.a { transform: translateX(var(--semantic-dimension-space-gap-small)) scale(var(--semantic-number-opacity-visible)); }`,
        tokenPropertyCompatibilityName,
        {
          semanticRoles: {
            transform: ['semantic.dimension.space.gap.', 'semantic.number.opacity.'],
          },
        },
      ),
    ).toHaveLength(0);
  });

  it('rejects other tokens for transitions, scales, and translations', async () => {
    const warnings = await lint(
      `.a {
      transition: opacity var(--semantic-dimension-space-gap-small);
      transition-duration: var(--primitive-duration-150);
      scale: var(--semantic-number-opacity-disabled);
      translate: var(--semantic-dimension-space-gap-small);
      transform: translateX(var(--semantic-dimension-space-gap-small)) scale(var(--semantic-number-opacity-visible));
    }`,
      tokenPropertyCompatibilityName,
    );
    const text = warnings.map((warning) => warning.text).join('\n');
    expect(text).toContain('incompatible with "transition"');
    expect(text).toContain('wrong role for "scale"');
    expect(text).toContain('wrong role for "translate"');
    expect(text).toContain('expected semantic.dimension.travel.');
    expect(text).toContain('expected semantic.number.scale.');
    expect(warnings).toHaveLength(5);
  });
});

describe(transitionTypeCompatibilityName, () => {
  it('accepts the transition type each property needs', async () => {
    expect(
      await lint(
        `.a {
        transition:
          transform var(--semantic-transition-movement-popup),
          opacity var(--semantic-transition-fade),
          background-color var(--semantic-transition-feedback),
          border-block-start-color var(--semantic-transition-feedback),
          visibility var(--semantic-transition-fade) allow-discrete,
          filter var(--semantic-transition-fade);
      }
      .b {
        transition-property: top, opacity;
        transition-duration: var(--semantic-transition-movement-drawer-duration), var(--semantic-transition-fade-duration);
        transition-timing-function: var(--semantic-transition-movement-drawer-timing-function), var(--semantic-transition-fade-timing-function);
      }
      .c { transition: none; }
      .d { transition: --semantic-number-scale-rest var(--semantic-transition-fade); }
      .e { transition-property: --semantic-number-scale-rest; transition-duration: var(--semantic-transition-fade-duration); }`,
        transitionTypeCompatibilityName,
      ),
    ).toHaveLength(0);
  });

  it('rejects movement without a movement transition, mismatched fades and feedback, and all', async () => {
    const warnings = await lint(
      `.a {
      transition:
        transform var(--semantic-transition-fade),
        height calc(2 * var(--semantic-transition-feedback-duration)) var(--semantic-transition-feedback-timing-function),
        opacity var(--semantic-transition-movement-popup),
        color var(--semantic-transition-fade),
        margin-block-start var(--semantic-transition-fade),
        padding var(--semantic-transition-feedback);
    }
    .b { transition: var(--semantic-transition-fade); }
    .c { transition-property: all; transition-duration: var(--semantic-transition-fade-duration); }
    .d {
      transition-property: opacity, inline-size;
      transition-duration: var(--semantic-transition-fade-duration);
    }`,
      transitionTypeCompatibilityName,
    );
    const text = warnings.map((warning) => warning.text).join('\n');
    expect(text).toContain('"transform" needs a semantic.transition.movement.* token');
    expect(text).toContain('"height" needs a semantic.transition.movement.* token');
    expect(text).toContain('"opacity" needs a semantic.transition.fade token');
    expect(text).toContain('"color" needs a semantic.transition.feedback token');
    expect(text).toContain('"inline-size" needs a semantic.transition.movement.* token');
    expect(text).toContain('"margin-block-start" needs a semantic.transition.movement.* token');
    expect(text).toContain('"padding" needs a semantic.transition.movement.* token');
    expect(text.match(/Do not transition "all"/g)).toHaveLength(2);
    expect(warnings).toHaveLength(10);
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
