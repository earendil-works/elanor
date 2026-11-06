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

/**
 * The site's name beside its logo, linking to the home page. The logo is the brand's symbol, the
 * project's own images (`logo` in elanor-docs.json, paths below the site's base), or none.
 */
export function SiteIdentity({
  name,
  brand,
  logo,
  base,
}: {
  readonly name: string;
  readonly brand: RuntimeConfig['brand'];
  readonly logo: RuntimeConfig['logo'];
  /** The site's base, which is also the home page's address. */
  readonly base: string;
}): React.JSX.Element {
  const Mark = brandSymbols[brand];
  let mark: React.JSX.Element | null;
  if (logo === false) {
    mark = null;
  } else if (logo === undefined) {
    mark = <Mark className="docs-identity-mark" aria-hidden="true" />;
  } else if (logo.dark === undefined) {
    mark = <img className="docs-identity-mark" src={`${base}${logo.light}`} alt="" />;
  } else {
    mark = (
      <>
        <img
          className="docs-identity-mark docs-identity-light"
          src={`${base}${logo.light}`}
          alt=""
        />
        <img className="docs-identity-mark docs-identity-dark" src={`${base}${logo.dark}`} alt="" />
      </>
    );
  }
  return (
    <Link href={base} aria-label={`${name} documentation home`} className="docs-identity">
      {mark}
      {logo && logo.replacesName ? null : <span>{name}</span>}
    </Link>
  );
}
