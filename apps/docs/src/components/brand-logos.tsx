import {Heading, Link, Stack, Text} from '@earendil-works/elanor-react';
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

const url = (path: string) => `/api/logos/${path}`;

interface BrandLogosProps {
  readonly brand: LogoBrand;
  readonly pressKit?: string | undefined;
}

/** Every logo of a brand on its intended background, with download links. */
export function BrandLogos({brand, pressKit}: BrandLogosProps): React.JSX.Element {
  const kinds = [...new Set(brand.assets.map((asset) => asset.kind))];
  return (
    <section className={styles.brand} aria-labelledby={`brand-${brand.id}`}>
      <Stack direction="row" align="center" gap="large" wrap="wrap">
        <Heading level={2} size={2} id={`brand-${brand.id}`}>
          {brand.name}
        </Heading>
        {pressKit ? <Link href={url(pressKit)} download>Download press kit</Link> : null}
      </Stack>
      {kinds.map((kind) => (
        <Stack key={kind} gap="small">
          <Heading level={3} size={3}>
            {kindLabels[kind]}
          </Heading>
          <ul className={styles.grid}>
            {brand.assets
              .filter((asset) => asset.kind === kind)
              .map((asset) => (
                <li key={asset.id} className={styles.tile}>
                  <div className={styles.preview} style={{background: brand.backgrounds[asset.scheme]}}>
                    <img src={url(asset.files.svg)} alt={`${brand.name} ${kindLabels[kind].toLowerCase()}, ${treatmentLabels[asset.treatment].toLowerCase()}`} />
                  </div>
                  <Text>{treatmentLabels[asset.treatment]}</Text>
                  <Stack direction="row" gap="small" wrap="wrap">
                    <Link href={url(asset.files.svg)} download>SVG</Link>
                    {asset.files.png ? <Link href={url(asset.files.png)} download>PNG</Link> : null}
                    {Object.entries(asset.files.pdf ?? {}).map(([profile, path]) => (
                      <Link key={profile} href={url(path)} download>
                        {profile === 'psoCoatedV3' ? 'PDF coated' : 'PDF uncoated'}
                      </Link>
                    ))}
                  </Stack>
                </li>
              ))}
          </ul>
        </Stack>
      ))}
      {brand.favicons ? (
        <Stack gap="small">
          <Heading level={3} size={3}>
            Web and social
          </Heading>
          <Stack direction="row" gap="small" wrap="wrap">
            {Object.entries(brand.favicons).map(([name, path]) => (
              <Link key={name} href={url(path)} download>
                {path.split('/').at(-1)}
              </Link>
            ))}
            {brand.avatars?.map((avatar) => (
              <Link key={avatar.path} href={url(avatar.path)} download>
                {avatar.path.split('/').at(-1)}
              </Link>
            ))}
          </Stack>
        </Stack>
      ) : null}
    </section>
  );
}
