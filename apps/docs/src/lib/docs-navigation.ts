import {componentGroups} from './component-groups.ts';
import {componentName} from './component-name.ts';
import {defaultTokenBrand, tokenAreaHref, tokenAreas} from './token-pages.ts';

/*
 * The documentation's navigation: a top navigation item for each section of the site, and for a
 * section with several pages, a side navigation of them on wide screens; narrower, the top
 * navigation's menu holds both. Server-only: the pages render it without React in the browser.
 */

export interface DocsNavigationLink {
  readonly href: string;
  readonly label: string;
}

/** Links under an optional label, such as a component category. */
export interface DocsNavigationGroup {
  readonly label?: string;
  readonly links: readonly DocsNavigationLink[];
}

/** A section of the site: a top navigation item, and the side navigation of its pages. */
export interface DocsSiteSection {
  readonly id: string;
  readonly label: string;
  /** Where the top navigation item leads. */
  readonly href: string;
  /** Paths the section's pages start with. */
  readonly paths: readonly string[];
  /** The section's pages; with more than one, the section has a side navigation. */
  readonly groups: readonly DocsNavigationGroup[];
}

const link = (href: string, label: string): DocsNavigationLink => ({href, label});

/**
 * The site's sections for the page at `current`. Token links stay on the brand of the current
 * token page.
 */
export async function docsNavigation(current: string): Promise<DocsSiteSection[]> {
  const tokenBrand = /^\/tokens\/([^/]+)\//.exec(current)?.[1] ?? defaultTokenBrand;
  return [
    {id: 'brand', label: 'Brand', href: '/brand/', paths: ['/brand/'], groups: []},
    {
      id: 'foundations',
      label: 'Foundations',
      href: '/fonts/',
      paths: ['/fonts/', '/icons/'],
      groups: [{links: [link('/fonts/', 'Fonts'), link('/icons/', 'Icons')]}],
    },
    {
      id: 'tokens',
      label: 'Tokens',
      href: '/tokens/',
      paths: ['/tokens/'],
      groups: [
        {
          links: [
            link('/tokens/', 'Overview'),
            ...tokenAreas.map((area) => link(tokenAreaHref(tokenBrand, area.id), area.label)),
          ],
        },
      ],
    },
    {
      id: 'components',
      label: 'Components',
      href: '/components/',
      paths: ['/components/'],
      groups: [
        {links: [link('/components/', 'Overview')]},
        ...(await componentGroups()).map((group) => ({
          label: group.label,
          links: group.entries.map((entry) =>
            link(`/components/${entry.id}/`, componentName(entry.id)),
          ),
        })),
      ],
    },
  ];
}

/** The section of the page at `current`. */
export function currentSection(
  sections: readonly DocsSiteSection[],
  current: string,
): DocsSiteSection | undefined {
  return sections.find((section) => section.paths.some((path) => current.startsWith(path)));
}

/** Whether a section has a side navigation: a section with one page has none. */
export function hasSideNavigation(
  section: DocsSiteSection | undefined,
): section is DocsSiteSection {
  return section !== undefined && section.groups.flatMap((group) => group.links).length > 1;
}
