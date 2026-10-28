import {componentGroups} from './component-groups.ts';
import {componentName} from './component-name.ts';
import {defaultTokenBrand, tokenAreaHref, tokenAreas} from './token-pages.ts';

/*
 * The documentation's navigation, rendered as the side navigation on wide screens and in the top
 * navigation's menu on narrow ones. Server-only: the pages render it without React in the browser.
 */

export interface DocsNavigationLink {
  readonly type: 'link';
  readonly href: string;
  readonly label: string;
}

/** A collapsible group of links. */
export interface DocsNavigationSection {
  readonly type: 'section';
  readonly id: string;
  readonly label: string;
  readonly links: readonly DocsNavigationLink[];
}

export type DocsNavigationItem = DocsNavigationLink | DocsNavigationSection;

export interface DocsNavigationGroup {
  readonly label: string;
  readonly items: readonly DocsNavigationItem[];
}

const link = (href: string, label: string): DocsNavigationLink => ({type: 'link', href, label});

/**
 * The navigation groups for the page at `current`. Token links stay on the brand of the current
 * token page.
 */
export async function docsNavigation(current: string): Promise<DocsNavigationGroup[]> {
  const tokenBrand = /^\/tokens\/([^/]+)\//.exec(current)?.[1] ?? defaultTokenBrand;
  return [
    {label: 'Brand', items: [link('/brand/', 'Overview')]},
    {label: 'Foundations', items: [link('/fonts/', 'Fonts'), link('/icons/', 'Icons')]},
    {
      label: 'Tokens',
      items: [
        link('/tokens/', 'Overview'),
        ...tokenAreas.map((area) => link(tokenAreaHref(tokenBrand, area.id), area.label)),
      ],
    },
    {
      label: 'Components',
      items: [
        link('/components/', 'Overview'),
        ...(await componentGroups()).map((group): DocsNavigationSection => ({
          type: 'section',
          id: group.category,
          label: group.label,
          links: group.entries.map((entry) =>
            link(`/components/${entry.id}/`, componentName(entry.id)),
          ),
        })),
      ],
    },
  ];
}
