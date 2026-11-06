import type {NavigationGroup} from '../components/DocsNavigation.tsx';
import type {DocsPage, Site} from './site.ts';

/** The site's navigation as the components take it. */
export function navigationGroups(site: Site): NavigationGroup[] {
  return site.nav.map((group) => ({
    label: group.label,
    links: group.links.map((link) => ({href: link.page.url, label: link.label})),
  }));
}

/** The pages before and after `page` in the navigation's order. */
export function neighbors(site: Site, page: DocsPage): {previous?: DocsPage; next?: DocsPage} {
  const index = site.sequence.indexOf(page);
  if (index === -1) return {};
  const previous = site.sequence[index - 1];
  const next = site.sequence[index + 1];
  return {...(previous ? {previous} : {}), ...(next ? {next} : {})};
}
