// Publication follows this order; dependencies must precede their dependents.
export const packages = [
  ['@earendil-works/design-tokens', 'packages/design-tokens', ['LICENSE']],
  [
    '@earendil-works/elanor-fonts',
    'packages/fonts',
    ['licenses/mallos-serif.txt', 'licenses/commit-mono.txt', 'licenses/departure-mono.txt'],
  ],
  [
    '@earendil-works/elanor-icons-react',
    'packages/icons/plain/react',
    ['dist/LICENSE', 'dist/NOTICE', 'dist/provenance.json'],
  ],
  [
    '@earendil-works/elanor-icons-boiled-react',
    'packages/icons/boiled/react',
    ['dist/LICENSE', 'dist/NOTICE', 'dist/provenance.json'],
  ],
  ['@earendil-works/elanor-logos-react', 'packages/logos/react', []],
  [
    '@earendil-works/stylelint-plugin-design-tokens',
    'packages/stylelint-plugin-design-tokens',
    ['LICENSE'],
  ],
  ['@earendil-works/elanor-react', 'packages/react', ['LICENSE']],
];

// Keep in sync with Elanor's entry in earendil-works/pkg (src/config.ts).
export const previewPackages = [
  ...packages.map(([name, directory]) => [name, directory]),
  ['@earendil-works/elanor-icons', 'packages/icons/plain'],
  ['@earendil-works/elanor-icons-boiled', 'packages/icons/boiled'],
  ['@earendil-works/elanor-logos', 'packages/logos'],
  ['@earendil-works/elanor-code-themes', 'packages/code-themes'],
];

export function tarballName(name, version) {
  const base = name.slice(1).replace('/', '-');
  return version === undefined ? `${base}.tgz` : `${base}-${version}.tgz`;
}
