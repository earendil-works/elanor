import {Container, Grid, Prose} from '@earendil-works/elanor-react';
import type {ComponentProps} from 'react';

import {childrenHtml} from '../lib/astro-children.ts';

/* Elanor's layout components around Astro content (see `lib/astro-children.ts`). */

/** The content column: Elanor's `Container`, at most 1216px wide with its gutters. */
export function DocsContainer({children, ...props}: ComponentProps<'div'>): React.JSX.Element {
  return <Container {...props} dangerouslySetInnerHTML={childrenHtml(children)} />;
}

/** Elanor's 12-column `Grid`; the docs place its children with their own styles. */
export function DocsGrid({children, ...props}: ComponentProps<'div'>): React.JSX.Element {
  return <Grid.Root {...props} dangerouslySetInnerHTML={childrenHtml(children)} />;
}

/** Long-form content: Elanor's `Prose`. */
export function DocsProse({children, ...props}: ComponentProps<'div'>): React.JSX.Element {
  return <Prose {...props} dangerouslySetInnerHTML={childrenHtml(children)} />;
}
