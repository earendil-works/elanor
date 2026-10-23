import {Heading, InlineCode, Link, Stack, Text} from '@earendil-works/elanor-react';
import type {ReactNode} from 'react';

import type {LogoAsset, LogoBrand} from '../lib/packages.ts';

import styles from './brand-logos.module.css';

const kindLabels: Record<LogoAsset['kind'], string> = {
  logo: 'Symbol',
  'logo-wordmark-horizontal': 'Horizontal lockup',
  'logo-wordmark-vertical': 'Vertical lockup',
};

const treatmentLabels: Record<LogoAsset['treatment'], string> = {
  'on-light': 'On light',
  'on-dark': 'On dark',
  'monochrome-on-light': 'Monochrome on light',
  'monochrome-on-dark': 'Monochrome on dark',
};

/** Favicon files shown as icons, with what each is for. The manifest and head tags are part of the setup instead. */
const iconDescriptions: Record<string, {label: string; use: string; masked?: boolean}> = {
  svg: {label: 'SVG favicon', use: 'Modern browsers; follows light and dark mode'},
  ico: {label: 'ICO favicon', use: 'Older browsers'},
  appleTouchIcon: {label: 'Apple touch icon', use: 'iOS home screen'},
  maskable: {
    label: 'Maskable icon',
    use: 'Android home screen, cropped to any shape',
    masked: true,
  },
};
const setupFiles = new Set(['webmanifest', 'html']);

/** Download labels for the print profiles the logo build exports. */
const printProfileLabels: Record<string, string> = {
  psoCoatedV3: 'PDF coated',
  psoUncoatedV3: 'PDF uncoated',
};

const url = (path: string) => `/api/logos/files/${path}`;

function printProfileLabel(profile: string): string {
  const label = printProfileLabels[profile];
  if (!label)
    throw new Error(`No label for the ${profile} print profile; add it to printProfileLabels`);
  return label;
}
const fileName = (path: string) => path.split('/').at(-1);

/** The 1×, 2×, and 3× preview PNGs when the logo has them, otherwise its SVG. */
function previewImage(asset: LogoAsset): {src: string; srcSet?: string} {
  const preview = asset.files.preview;
  if (!preview?.length) return {src: url(asset.files.svg)};
  const [base] = preview.toSorted((a, b) => a.height - b.height);
  return {
    src: url(base!.path),
    srcSet: preview.map((file) => `${url(file.path)} ${file.height / base!.height}x`).join(', '),
  };
}

function describeIcon(key: string): {label: string; use: string; masked?: boolean} {
  const description = iconDescriptions[key];
  if (description) return description;
  const appIcon = /^icon(\d+)$/.exec(key);
  if (appIcon) return {label: `App icon, ${appIcon[1]} px`, use: 'Web app manifest'};
  throw new Error(`No description for the ${key} favicon; add it to iconDescriptions`);
}

interface BrandLogosProps {
  readonly brand: LogoBrand;
  readonly pressKit?: string | undefined;
  /** The favicon head tags, rendered by the page so they can be copied. */
  readonly children?: ReactNode;
}

/** Every logo of a brand on its intended background, its profile pictures and favicons, with download links. */
export function BrandLogos({brand, pressKit, children}: BrandLogosProps): React.JSX.Element {
  const kinds = [...new Set(brand.assets.map((asset) => asset.kind))];
  const icons = Object.entries(brand.favicons ?? {}).filter(([key]) => !setupFiles.has(key));
  const avatarTreatments = [...new Set(brand.avatars?.map((avatar) => avatar.treatment))];
  return (
    <section className={styles.brand} aria-labelledby={`brand-${brand.id}`}>
      <Stack direction="row" align="center" gap="large" wrap="wrap">
        <Heading level={2} size={4} id={`brand-${brand.id}`}>
          {brand.name}
        </Heading>
        {pressKit ? (
          <Link href={url(pressKit)} download>
            Download press kit
          </Link>
        ) : null}
      </Stack>

      {kinds.map((kind) => (
        <Stack key={kind} gap="small">
          <Heading level={3} size={6}>
            {kindLabels[kind]}
          </Heading>
          <ul className={styles.grid}>
            {brand.assets
              .filter((asset) => asset.kind === kind)
              .map((asset) => (
                <li key={asset.id} className={styles.tile}>
                  <div
                    className={styles.preview}
                    style={{background: brand.backgrounds[asset.scheme]}}
                  >
                    <img
                      {...previewImage(asset)}
                      loading="lazy"
                      decoding="async"
                      alt={`${brand.name} ${kindLabels[kind].toLowerCase()}, ${treatmentLabels[asset.treatment].toLowerCase()}`}
                    />
                  </div>
                  <Text>{treatmentLabels[asset.treatment]}</Text>
                  <Stack direction="row" gap="small" wrap="wrap">
                    <Link href={url(asset.files.svg)} download>
                      SVG
                    </Link>
                    {asset.files.png ? (
                      <Link href={url(asset.files.png)} download>
                        PNG
                      </Link>
                    ) : null}
                    {Object.entries(asset.files.pdf ?? {}).map(([profile, path]) => (
                      <Link key={profile} href={url(path)} download>
                        {printProfileLabel(profile)}
                      </Link>
                    ))}
                  </Stack>
                </li>
              ))}
          </ul>
        </Stack>
      ))}

      {avatarTreatments.length > 0 ? (
        <Stack gap="small">
          <Heading level={3} size={6}>
            Profile pictures
          </Heading>
          <ul className={styles.grid}>
            {avatarTreatments.map((treatment) => {
              const sizes = brand.avatars!.filter((avatar) => avatar.treatment === treatment);
              const largest = sizes.reduce((a, b) => (b.size > a.size ? b : a));
              return (
                <li key={treatment} className={styles.tile}>
                  <div className={styles.preview}>
                    <img
                      className={styles.avatar}
                      src={url(largest.path)}
                      alt={`${brand.name} avatar, ${treatment}`}
                    />
                  </div>
                  <Text>{treatmentLabels[treatment as LogoAsset['treatment']]}</Text>
                  <Stack direction="row" gap="small" wrap="wrap">
                    {sizes.map((avatar) => (
                      <Link key={avatar.path} href={url(avatar.path)} download>
                        {avatar.size} px
                      </Link>
                    ))}
                  </Stack>
                </li>
              );
            })}
          </ul>
        </Stack>
      ) : null}

      {icons.length > 0 ? (
        <Stack gap="small">
          <Heading level={3} size={6}>
            Favicons and app icons
          </Heading>
          <ul className={styles.grid}>
            {icons.map(([key, path]) => {
              const {label, use, masked} = describeIcon(key);
              return (
                <li key={key} className={`${styles.tile} ${styles.small}`}>
                  <div className={styles.preview} style={{background: brand.backgrounds.light}}>
                    <img
                      className={masked ? styles.round : undefined}
                      src={url(path)}
                      alt={`${brand.name} ${label.toLowerCase()}`}
                    />
                  </div>
                  <Text>{label}</Text>
                  <Text className={styles.note}>{use}</Text>
                  <Link href={url(path)} download>
                    {fileName(path)}
                  </Link>
                </li>
              );
            })}
          </ul>
          {children ? (
            <div className={styles.setup}>
              <Text>
                Put the files in your site's root, with{' '}
                {brand.favicons?.webmanifest ? (
                  <Link href={url(brand.favicons.webmanifest)} download>
                    site.webmanifest
                  </Link>
                ) : (
                  'the web app manifest'
                )}
                , and add these tags to its <InlineCode>&lt;head&gt;</InlineCode>:
              </Text>
              {children}
              <Text className={styles.note}>
                In this repository,{' '}
                <InlineCode>elanor-logos favicons {brand.id} --out public</InlineCode> copies the
                files for you; see the logos package README.
              </Text>
            </div>
          ) : null}
        </Stack>
      ) : null}
    </section>
  );
}
