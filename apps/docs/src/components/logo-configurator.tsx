import {
  Button,
  Field,
  Heading,
  Input,
  SegmentedControl,
  SegmentedControlItem,
  Stack,
  Switch,
  Text,
} from '@earendil-works/elanor-react';
import {useEffect, useId, useMemo, useState} from 'react';
import type {LogoManifest} from '../lib/packages.ts';
import styles from './logo-configurator.module.css';

interface LogoConfiguratorProps {
  readonly manifest: LogoManifest;
}

const kinds = [
  ['logo', 'Symbol'],
  ['logo-wordmark-horizontal', 'Horizontal'],
  ['logo-wordmark-vertical', 'Vertical'],
] as const;

const treatments = [
  ['on-light', 'On light'],
  ['on-dark', 'On dark'],
  ['monochrome-on-light', 'Mono on light'],
  ['monochrome-on-dark', 'Mono on dark'],
] as const;

/** Renders any logo at a chosen height, optionally with clear space and its background, as SVG or PNG. */
export function LogoConfigurator({manifest}: LogoConfiguratorProps): React.JSX.Element {
  const [brandId, setBrandId] = useState(manifest.brands[0]?.id ?? '');
  const [kind, setKind] = useState<string>('logo-wordmark-horizontal');
  const [treatment, setTreatment] = useState<string>('on-light');
  const [height, setHeight] = useState(128);
  const [clearSpace, setClearSpace] = useState(true);
  const [background, setBackground] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const clearSpaceLabel = useId();
  const backgroundLabel = useId();

  const brand = manifest.brands.find(({id}) => id === brandId) ?? manifest.brands[0]!;
  const asset = brand.assets.find((candidate) => candidate.kind === kind && candidate.treatment === treatment);

  useEffect(() => {
    if (!asset) return;
    let current = true;
    void fetch(`/api/logos/${asset.files.svg}`)
      .then((response) => response.text())
      .then((text) => current && setSource(text));
    return () => {
      current = false;
    };
  }, [asset]);

  const output = useMemo(() => {
    if (!asset || !source) return null;
    const inner = source.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
    const padding = clearSpace ? manifest.clearSpace : 0;
    const viewWidth = asset.width + 2 * padding;
    const viewHeight = asset.height + 2 * padding;
    // Heights outside 16–4096 px are clamped.
    const pixelHeight = Math.min(4096, Math.max(16, Math.round(height)));
    const pixelWidth = Math.round((pixelHeight * viewWidth) / viewHeight);
    const fill = background ? `<rect x="${-padding}" y="${-padding}" width="${viewWidth}" height="${viewHeight}" fill="${brand.backgrounds[asset.scheme]}"/>` : '';
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${pixelWidth}" height="${pixelHeight}" viewBox="${-padding} ${-padding} ${viewWidth} ${viewHeight}">${fill}${inner}</svg>`;
    return {svg, pixelWidth, pixelHeight, name: `${asset.id}-${pixelHeight}px${clearSpace ? '-clear-space' : ''}`};
  }, [asset, source, clearSpace, background, height, brand, manifest.clearSpace]);

  const previewUrl = output ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(output.svg)}` : undefined;

  function download(blob: Blob, name: string): void {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = name;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function downloadPng(): Promise<void> {
    if (!output || !previewUrl) return;
    const image = new Image();
    image.src = previewUrl;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = output.pixelWidth;
    canvas.height = output.pixelHeight;
    canvas.getContext('2d')?.drawImage(image, 0, 0, output.pixelWidth, output.pixelHeight);
    canvas.toBlob((blob) => blob && download(blob, `${output.name}.png`), 'image/png');
  }

  return (
    <section className={styles.configurator} aria-labelledby="configurator-heading">
      <Heading level={2} size={2} id="configurator-heading">
        Export a logo
      </Heading>
      <Stack gap="large">
        <SegmentedControl aria-label="Brand" value={[brand.id]} onValueChange={(value) => value[0] && setBrandId(value[0])}>
          {manifest.brands.map(({id, name}) => (
            <SegmentedControlItem key={id} value={id}>
              {name}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
        <SegmentedControl aria-label="Logo" value={[kind]} onValueChange={(value) => value[0] && setKind(value[0])}>
          {kinds.map(([value, label]) => (
            <SegmentedControlItem key={value} value={value}>
              {label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
        <SegmentedControl aria-label="Color" value={[treatment]} onValueChange={(value) => value[0] && setTreatment(value[0])}>
          {treatments.map(([value, label]) => (
            <SegmentedControlItem key={value} value={value}>
              {label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
        <Stack direction="row" gap="xLarge" align="end" wrap="wrap">
          <Field.Root>
            <Field.Label>Height in pixels</Field.Label>
            <Input
              inputMode="numeric"
              pattern="[0-9]*"
              value={String(height)}
              onChange={(event) => setHeight(Number(event.currentTarget.value.replace(/\D/g, '')) || 0)}
            />
          </Field.Root>
          <Stack direction="row" gap="small" align="center">
            <Switch.Root checked={clearSpace} onCheckedChange={setClearSpace} aria-labelledby={clearSpaceLabel}>
              <Switch.Thumb />
            </Switch.Root>
            <Text id={clearSpaceLabel}>Include clear space</Text>
          </Stack>
          <Stack direction="row" gap="small" align="center">
            <Switch.Root checked={background} onCheckedChange={setBackground} aria-labelledby={backgroundLabel}>
              <Switch.Thumb />
            </Switch.Root>
            <Text id={backgroundLabel}>Fill background</Text>
          </Stack>
        </Stack>
        <div className={styles.stage} data-scheme={asset?.scheme}>
          {previewUrl ? <img src={previewUrl} alt="Logo preview" /> : null}
        </div>
        <Stack direction="row" gap="small" align="center" wrap="wrap">
          <Button onClick={() => void downloadPng()} disabled={!output}>
            Download PNG
          </Button>
          <Button
            hierarchy="secondary"
            onClick={() => output && download(new Blob([output.svg], {type: 'image/svg+xml'}), `${output.name}.svg`)}
            disabled={!output}
          >
            Download SVG
          </Button>
          {output ? (
            <Text>
              {output.pixelWidth} × {output.pixelHeight} px
            </Text>
          ) : null}
        </Stack>
      </Stack>
    </section>
  );
}
