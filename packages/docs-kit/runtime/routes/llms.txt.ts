import type {APIRoute} from 'astro';

import {absoluteUrl, config, getSite} from '../content/context.ts';

/*
 * `llms.txt` (llmstxt.org): the site's pages for agents, each linking to its Markdown, which the
 * site publishes beside the pages.
 */

export const GET: APIRoute = () => {
  const site = getSite();
  const line = (page: (typeof site.pages)[number]) =>
    `- [${page.title}](${absoluteUrl(`${config.base}${page.file}`)})${page.description ? `: ${page.description}` : ''}`;
  const listed = new Set(site.sequence);
  const sections = site.nav.map(
    (group) =>
      `## ${group.label ?? 'Docs'}\n\n${group.links.map((link) => line(link.page)).join('\n')}`,
  );
  const others = site.pages.filter((page) => !listed.has(page));
  if (others.length > 0) sections.push(`## Optional\n\n${others.map(line).join('\n')}`);
  const text = [
    `# ${config.name}`,
    ...(config.description ? [`> ${config.description}`] : []),
    ...sections,
  ].join('\n\n');
  return new Response(`${text}\n`, {headers: {'Content-Type': 'text/plain; charset=utf-8'}});
};
