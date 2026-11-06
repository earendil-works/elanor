/** @jsxImportSource react */
import {EarendilSymbol} from '@earendil-works/elanor-logos-react/earendil/symbol';
import {LefosSymbol} from '@earendil-works/elanor-logos-react/lefos/symbol';
import {PiSymbol} from '@earendil-works/elanor-logos-react/pi/symbol';
import {RadiusSymbol} from '@earendil-works/elanor-logos-react/radius/symbol';
import {Link} from '@earendil-works/elanor-react';
import type {ComponentType} from 'react';

import type {RuntimeConfig} from '../content/context.ts';

type BrandSymbol = ComponentType<{className?: string; 'aria-hidden'?: 'true'; scheme?: 'light'}>;

/** The brand's symbol for a brand of the design tokens; Elanor's own docs use Earendil's. */
export const brandSymbols: Record<RuntimeConfig['brand'], BrandSymbol> = {
  earendil: EarendilSymbol,
  elanor: EarendilSymbol,
  pi: PiSymbol,
  radius: RadiusSymbol,
  lefos: LefosSymbol,
};

/** The site's name beside its brand's symbol, linking to the home page. */
export function SiteIdentity({
  name,
  brand,
  href,
}: {
  readonly name: string;
  readonly brand: RuntimeConfig['brand'];
  readonly href: string;
}): React.JSX.Element {
  const Mark = brandSymbols[brand];
  return (
    <Link href={href} aria-label={`${name} documentation home`} className="docs-identity">
      <Mark className="docs-identity-mark" aria-hidden="true" />
      <span>{name}</span>
    </Link>
  );
}
