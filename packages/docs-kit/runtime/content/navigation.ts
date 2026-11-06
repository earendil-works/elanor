import type {NavigationGroup, NavigationNode} from '../components/DocsNavigation.tsx';
import type {NavItem} from './nav.ts';
import type {DocsPage, Site} from './site.ts';

/** The site's navigation as the components take it, with the sections around `current` open. */
export function navigationGroups(site: Site, current: string): NavigationGroup[] {
  const node = (item: NavItem, path: string): NavigationNode => {
    if (item.kind === 'page') return {kind: 'link', href: item.page.url, label: item.label};
    if (item.kind === 'link') return {kind: 'link', href: item.href, label: item.label};
    const id = `${path}/${item.label}`;
    const items = item.items.map((child) => node(child, id));
    const holdsCurrent = (nodes: readonly NavigationNode[]): boolean =>
      nodes.some((child) =>
        child.kind === 'link' ? child.href === current : holdsCurrent(child.items),
      );
    return {
      kind: 'section',
      id,
      label: item.label,
      open: !item.collapsed || holdsCurrent(items),
      items,
    };
  };
  return site.nav.map((group) => ({
    label: group.label,
    items: group.items.map((item) => node(item, group.label ?? '')),
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
