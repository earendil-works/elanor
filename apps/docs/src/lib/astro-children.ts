import {isValidElement, type ReactNode} from 'react';

/*
 * Astro renders the children of the React components it renders first and passes them as one
 * element holding their HTML, which React would wrap in an element of its own. Components that
 * take Astro children set this HTML as their element's inner HTML instead.
 */

export interface InnerHtml {
  readonly __html: string;
}

/** The HTML of children that Astro passed to a React component. */
export function childrenHtml(children: ReactNode): InnerHtml | undefined {
  if (!isValidElement<{value?: unknown}>(children) || children.props.value === undefined) {
    return undefined;
  }
  return {__html: String(children.props.value)};
}
