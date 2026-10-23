import {SearchOffIcon} from '@earendil-works/elanor-icons-boiled-react';
import {Button, EmptyState, Heading, IconButton, Link, Search} from '@earendil-works/elanor-react';

import type {
  TokenAreaPage,
  TokenBrandOption,
  TokenEntry,
  TokenGroup,
  TokenPreview as Preview,
  TokenSection,
  TokenState,
} from '../lib/token-pages.ts';
import {tokenAreaHref} from '../lib/token-pages.ts';
import {CopyStatus, StaticCopyButton} from './static-copy-button.tsx';

import styles from './token-area.module.css';

interface BrandPickerProps {
  readonly brands: readonly TokenBrandOption[];
  readonly current: string;
  readonly area: string;
}

/**
 * Links to the same area for each brand, styled like tabs. Changing brand loads another page, so it is
 * navigation with `aria-current`, not a tab list. Brands without their own values are disabled.
 */
export function BrandPicker({brands, current, area}: BrandPickerProps): React.JSX.Element {
  return (
    <nav aria-label="Brand" className={styles.brands}>
      <ul className={styles.brandList}>
        {brands.map((brand) => (
          <li key={brand.id}>
            {brand.enabled ? (
              <a
                className={styles.brand}
                href={tokenAreaHref(brand.id, area)}
                aria-current={brand.id === current ? 'page' : undefined}
              >
                {brand.label}
              </a>
            ) : (
              // A disabled link: announced as a link, not focusable or clickable.
              <span className={styles.brand} role="link" aria-disabled="true">
                {brand.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

const icon = (name: string) => ({maskImage: `url(/api/icons/${name}.svg)`});

function EasingCurve({bezier}: {readonly bezier: readonly number[]}): React.JSX.Element {
  const [x1 = 0, y1 = 0, x2 = 1, y2 = 1] = bezier.map((n) => Math.round(n * 1000) / 10);
  // Progress runs bottom to top; the box leaves room for curves that overshoot.
  return (
    <svg className={styles.curve} viewBox="-4 -44 108 148" aria-hidden="true">
      <rect
        className={styles.curveFrame}
        x="0"
        y="0"
        width="100"
        height="100"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
      <path
        className={styles.curveLine}
        d={`M0 100 C${x1} ${100 - y1} ${x2} ${100 - y2} 100 0`}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

const sample = 'Sphinx of black quartz, judge my vow.';

/** A color over a scheme's canvas, so translucent colors show as they render. */
const onCanvas = (color: string, canvas: string) => ({
  background: `linear-gradient(${color}, ${color}), ${canvas}`,
});

function TokenPreview({preview, nameId}: {readonly preview: Preview; readonly nameId: string}) {
  switch (preview.kind) {
    case 'color':
      return (
        <span className={styles.swatches} aria-hidden="true">
          <span className={styles.swatch} style={onCanvas(preview.light, preview.canvasLight)} />
          <span className={styles.swatch} style={onCanvas(preview.dark, preview.canvasDark)} />
        </span>
      );
    case 'typography':
      return (
        <span
          className={styles.sample}
          style={{font: preview.font, letterSpacing: preview.letterSpacing}}
          aria-hidden="true"
        >
          {sample}
        </span>
      );
    case 'font-family':
      return (
        <span className={styles.glyphs} style={{fontFamily: preview.family}} aria-hidden="true">
          Aa Gg 0123
        </span>
      );
    case 'font-weight':
      return (
        <span
          className={styles.glyphs}
          style={{fontFamily: preview.family, fontWeight: preview.weight}}
          aria-hidden="true"
        >
          Aa Gg 0123
        </span>
      );
    case 'length':
      return (
        <span className={styles.barTrack} aria-hidden="true">
          <span className={styles.bar} style={{inlineSize: preview.size}} />
        </span>
      );
    case 'radius':
      return (
        <span className={styles.shape} style={{borderRadius: preview.radius}} aria-hidden="true" />
      );
    case 'border-width':
      return (
        <span className={styles.barTrack} aria-hidden="true">
          <span className={styles.line} style={{blockSize: preview.width}} />
        </span>
      );
    case 'shadow':
      return (
        <span className={styles.swatches} aria-hidden="true">
          <span className={styles.stage} style={{background: preview.canvasLight}}>
            <span
              className={styles.raised}
              style={{background: preview.surfaceLight, boxShadow: preview.light}}
            />
          </span>
          <span className={styles.stage} style={{background: preview.canvasDark}}>
            <span
              className={styles.raised}
              style={{background: preview.surfaceDark, boxShadow: preview.dark}}
            />
          </span>
        </span>
      );
    case 'opacity':
      return (
        <span
          className={styles.shape}
          data-filled
          style={{opacity: preview.opacity}}
          aria-hidden="true"
        />
      );
    case 'scale':
      return (
        <span className={styles.scaleFrame} aria-hidden="true">
          <span className={styles.shape} data-filled style={{scale: preview.scale}} />
        </span>
      );
    case 'easing':
      return <EasingCurve bezier={preview.bezier} />;
    case 'motion':
      return (
        <span
          className={styles.motion}
          data-motion={preview.role}
          data-duration={preview.duration}
          data-delay={preview.delay}
          data-easing={preview.easing}
          data-opacity={preview.opacity}
        >
          <IconButton
            className={styles.play}
            aria-label="Play"
            aria-describedby={nameId}
            title="Play"
            data-motion-play
          >
            <span className={styles.icon} data-icon="play" style={icon('play-arrow')} />
            <span className={styles.icon} data-icon="replay" style={icon('replay')} />
          </IconButton>
          <span className={styles.motionTrack} aria-hidden="true">
            <span className={styles.motionTarget} data-motion-target />
          </span>
          <EasingCurve bezier={preview.bezier} />
        </span>
      );
    case 'none':
      return null;
  }
}

function Values({state}: {readonly state: TokenState}): React.JSX.Element {
  return (
    <dl className={styles.values}>
      {state.values.map((line) => (
        <div key={line.label} className={styles.value}>
          <dt>{line.label}</dt>
          <dd>
            {line.alias && line.alias.name === line.value ? (
              <Link className={styles.alias} href={line.alias.href}>
                {line.value}
              </Link>
            ) : (
              <>
                <code>{line.value}</code>
                {line.alias ? (
                  <>
                    {' '}
                    <Link className={styles.alias} href={line.alias.href}>
                      {line.alias.name}
                    </Link>
                  </>
                ) : null}
              </>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Variable({state}: {readonly state: TokenState}): React.JSX.Element {
  const variableId = `${state.id}-variable`;
  return (
    <p className={styles.variable}>
      <code id={variableId}>{state.cssVariable}</code>
      <StaticCopyButton
        value={state.cssVariable}
        aria-label="Copy CSS variable"
        aria-describedby={variableId}
      />
    </p>
  );
}

function Name({entry, id}: {readonly entry: TokenEntry; readonly id: string}): React.JSX.Element {
  return (
    <p className={styles.nameLine}>
      <code id={id} className={styles.name}>
        {entry.name}
      </code>
      {entry.brandSpecific ? <span className={styles.badge}>Brand-specific</span> : null}
    </p>
  );
}

/** A token, or a token with its states: one line per state, each with its own variable and values. */
function EntryRow({entry}: {readonly entry: TokenEntry}): React.JSX.Element {
  const nameId = `${entry.id}-name`;
  const filterText = entry.states.map((state) => state.path).join(' ');
  const description = entry.description ? (
    <p className={styles.description}>
      {/* Text in backticks names another token or value. */}
      {entry.description
        .split('`')
        .map((part, index) => (index % 2 === 1 ? <code key={index}>{part}</code> : part))}
    </p>
  ) : null;

  if (entry.states.length === 1) {
    const state = entry.states[0]!;
    const wide = state.preview.kind === 'typography' || state.preview.kind === 'motion';
    return (
      <li
        id={state.id}
        className={styles.row}
        data-wide={wide ? '' : undefined}
        data-filter-item
        data-filter-text={filterText}
      >
        <div className={styles.preview}>
          <TokenPreview preview={state.preview} nameId={nameId} />
        </div>
        <div className={styles.info}>
          <Name entry={entry} id={nameId} />
          <Variable state={state} />
          {description}
        </div>
        <Values state={state} />
      </li>
    );
  }

  return (
    <li
      className={styles.entry}
      data-filter-item
      data-filter-count={entry.states.length}
      data-filter-text={filterText}
    >
      <div className={styles.entryHeader}>
        <Name entry={entry} id={nameId} />
        {description}
      </div>
      <ul className={styles.states}>
        {entry.states.map((state) => (
          <li key={state.id} id={state.id} className={styles.row} data-state>
            <div className={styles.preview}>
              <TokenPreview preview={state.preview} nameId={nameId} />
            </div>
            <div className={styles.info}>
              <span className={styles.stateLabel}>{state.label}</span>
              <Variable state={state} />
            </div>
            <Values state={state} />
          </li>
        ))}
      </ul>
    </li>
  );
}

function Swatch({entry}: {readonly entry: TokenEntry}): React.JSX.Element {
  const state = entry.states[0]!;
  const variableId = `${state.id}-variable`;
  const color = state.preview.kind === 'color' ? state.preview.light : 'transparent';
  return (
    <li
      id={state.id}
      className={styles.tile}
      data-filter-item
      data-filter-text={`${state.path} ${state.cssVariable}`}
    >
      <span className={styles.tileSwatch} style={{background: color}} aria-hidden="true" />
      <span className={styles.tileMeta}>
        <span className={styles.tileStep}>
          <code id={variableId} className={styles.visuallyHidden}>
            {state.cssVariable}
          </code>
          {entry.step}
          {entry.brandSpecific ? (
            <span className={styles.visuallyHidden}> Brand-specific</span>
          ) : null}
        </span>
        <StaticCopyButton
          value={state.cssVariable}
          aria-label="Copy CSS variable"
          aria-describedby={variableId}
        />
      </span>
      <code className={styles.tileValue}>
        {state.values.find((line) => line.label === 'Hex')?.value}
      </code>
    </li>
  );
}

/** The group's colors in its summary: light above dark, or one row for a palette. */
function Strip({group}: {readonly group: TokenGroup}): React.JSX.Element | null {
  if (group.strip.length === 0) return null;
  const palette = group.layout === 'swatches';
  return (
    <span className={styles.strip} data-palette={palette ? '' : undefined} aria-hidden="true">
      {group.strip.map((color, index) => (
        <span key={index} className={styles.stripCell}>
          <span style={{background: color.light}} />
          {palette ? null : <span style={{background: color.dark}} />}
        </span>
      ))}
    </span>
  );
}

function Group({
  group,
  section,
  level,
}: {
  readonly group: TokenGroup;
  readonly section: string;
  readonly level: 2 | 3;
}): React.JSX.Element {
  const id = `${section}-${group.id}`;
  return (
    <details className={styles.group} id={id} data-filter-group>
      <summary className={styles.summary}>
        <span className={styles.chevron} style={icon('keyboard-arrow-down')} aria-hidden="true" />
        <Heading level={level} size={6} className={styles.groupHeading}>
          {group.label}
        </Heading>
        <span className={styles.count}>
          {group.count} {group.count === 1 ? 'token' : 'tokens'}
        </span>
        <Strip group={group} />
      </summary>
      {group.layout === 'swatches' ? (
        <ul className={styles.tiles}>
          {group.entries.map((entry) => (
            <Swatch key={entry.id} entry={entry} />
          ))}
        </ul>
      ) : (
        <ul className={styles.rows}>
          {group.entries.map((entry) => (
            <EntryRow key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </details>
  );
}

function Section({section}: {readonly section: TokenSection}): React.JSX.Element {
  const headingId = `section-${section.id}`;
  return (
    <section className={styles.section} aria-labelledby={headingId} data-filter-section>
      <Heading level={2} size={3} id={headingId}>
        {section.label}
      </Heading>
      <div className={styles.groups}>
        {section.groups.map((group) => (
          <Group key={group.id} group={group} section={section.id} level={3} />
        ))}
      </div>
    </section>
  );
}

/**
 * One area's tokens in sections of collapsed groups, as static HTML. `scripts/list-filter.ts` filters it,
 * `scripts/token-groups.ts` opens groups, `scripts/copy-buttons.ts` copies, and
 * `scripts/motion-previews.ts` plays the motion previews.
 */
export function TokenArea({page}: {readonly page: TokenAreaPage}): React.JSX.Element {
  // An area with one section shows its groups without a section heading.
  const [only] = page.sections.length === 1 ? page.sections : [];
  return (
    <div className={styles.area} data-filter="tokens">
      {page.note ? <p className={styles.note}>{page.note}</p> : null}
      <div className={styles.toolbar}>
        <Search
          rootClassName={styles.search}
          aria-label={`Search ${page.area.label.toLowerCase()} tokens`}
          placeholder={`Search ${page.total} tokens`}
          data-filter-search
        />
        <Button hierarchy="secondary" data-groups-toggle>
          Expand all
        </Button>
      </div>
      <p role="status" className={styles.visuallyHidden} data-filter-status />
      <CopyStatus />
      {only ? (
        <div className={styles.groups}>
          {only.groups.map((group) => (
            <Group key={group.id} group={group} section={only.id} level={2} />
          ))}
        </div>
      ) : (
        page.sections.map((section) => <Section key={section.id} section={section} />)
      )}
      <div hidden data-filter-empty>
        <EmptyState.Root>
          <EmptyState.Illustration>
            <SearchOffIcon size={64} />
          </EmptyState.Illustration>
          <EmptyState.Body>
            <EmptyState.Copy>
              <EmptyState.Title level={2}>No matching tokens</EmptyState.Title>
              <EmptyState.Description>
                Nothing matches “<span data-filter-query />
                ”. Try a shorter or different word.
              </EmptyState.Description>
            </EmptyState.Copy>
            <EmptyState.Actions>
              <Button hierarchy="secondary" data-filter-clear>
                Clear search
              </Button>
            </EmptyState.Actions>
          </EmptyState.Body>
        </EmptyState.Root>
      </div>
    </div>
  );
}
