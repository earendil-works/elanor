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

export function tarballName(name, version) {
  const base = name.slice(1).replace('/', '-');
  return version === undefined ? `${base}.tgz` : `${base}-${version}.tgz`;
}
