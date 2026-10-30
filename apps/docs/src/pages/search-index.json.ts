import type {APIRoute} from 'astro';
import {getCollection} from 'astro:content';
import Slugger from 'github-slugger';
import MiniSearch from 'minisearch';

import {orderedApi} from '../lib/component-api.ts';
import {componentCategoryLabels} from '../lib/component-categories.ts';
import {componentDescription} from '../lib/component-docs.ts';
import {componentName} from '../lib/component-name.ts';
import {demoBlock} from '../lib/demo-blocks.ts';
import {docsSearchOptions, type DocsSearchRecord} from '../lib/search-options.ts';
import {defaultTokenBrand, tokenAreaHref, tokenAreas} from '../lib/token-pages.ts';

/*
 * The docs search index, loaded by the search dialog (`scripts/docs-search-source.ts`): each
 * component page and its sections, the API's parts and props, and the other pages by their
 * introductions.
 */

/** Markdown as plain text: no code blocks, demos, or markup. */
function plainText(markdown: string): string {
  return markdown
    .replace(/^```[\s\S]*?^```$/gm, ' ')
    .replace(demoBlock, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/`|\*\*?/g, '')
    .replace(/[|>#]/g, ' ')
    .replace(/^\s*-{3,}\s*$/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function excerpt(text: string, length = 200): string {
  if (text.length <= length) return text;
  const cut = text.slice(0, length);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), length / 2))}…`;
}

/**
 * The ids of the `##` headings, in order, as the page renders them: Astro slugs every heading's
 * text with one GitHub slugger per page. Computed from the source, because rendering every page
 * here would take seconds in development.
 */
function sectionAnchors(body: string): string[] {
  const slugger = new Slugger();
  const anchors: string[] = [];
  for (const [, level = '', text = ''] of body
    .replace(/^```[\s\S]*?^```$/gm, '')
    .matchAll(/^(#{1,6}) (.+)$/gm)) {
    const slug = slugger.slug(plainText(text));
    if (level.length === 2) anchors.push(slug);
  }
  return anchors;
}

async function componentRecords(): Promise<DocsSearchRecord[]> {
  const records: DocsSearchRecord[] = [];
  for (const entry of await getCollection('components')) {
    const body = entry.body ?? '';
    const pageTitle = componentName(entry.id);
    const groupTitle = componentCategoryLabels[entry.data.category];
    const url = `/components/${entry.id}/`;
    const anchors = sectionAnchors(body);
    const [intro = '', ...sections] = body.replace(/^---[\s\S]*?^---$/m, '').split(/^## /m);

    const introText = plainText(intro.replace(/^# .*$/m, ''));
    records.push({
      id: url,
      url,
      title: pageTitle,
      pageTitle,
      groupTitle,
      text: introText,
      excerpt: componentDescription(entry),
    });
    sections.forEach((section, index) => {
      const [heading = '', ...lines] = section.split('\n');
      const title = plainText(heading);
      const text = plainText(lines.join('\n'));
      const anchor = anchors[index];
      records.push({
        id: `${url}#${anchor ?? index}`,
        url: anchor ? `${url}#${anchor}` : url,
        title,
        pageTitle,
        groupTitle,
        text: `${title} ${text}`,
        excerpt: excerpt(text),
      });
    });

    const parts = orderedApi(entry.id, body);
    if (parts.length > 0) {
      const names = parts.map((part) => part.name).join(', ');
      records.push({
        id: `${url}#api`,
        url: `${url}#api`,
        title: 'API',
        pageTitle,
        groupTitle,
        text: parts
          .flatMap((part) => [
            part.name,
            part.description ?? '',
            ...part.props.map((prop) => `${prop.name} ${prop.description ?? ''}`),
          ])
          .join(' '),
        excerpt: excerpt(names),
      });
    }
  }
  return records;
}

function pageRecord(
  url: string,
  title: string,
  groupTitle: string,
  text: string,
): DocsSearchRecord {
  return {id: url, url, title, pageTitle: title, groupTitle, text, excerpt: excerpt(text)};
}

export const GET: APIRoute = async () => {
  const records = [
    pageRecord(
      '/brand/',
      'Brand',
      'Brand',
      'Logos, clear space, favicons, and the press kit. Use the supplied artwork unchanged.',
    ),
    pageRecord(
      '/fonts/',
      'Fonts',
      'Foundations',
      'Self-hosted fonts with @font-face CSS. The design tokens name them.',
    ),
    pageRecord(
      '/icons/',
      'Icons',
      'Foundations',
      'Material Symbols with a hand-drawn boil. Select an icon for its React import and SVG.',
    ),
    pageRecord(
      '/tokens/',
      'Design tokens',
      'Tokens',
      'Named values for color, type, space, shape, and motion. Use semantic tokens in components; primitives are the raw values behind them.',
    ),
    ...tokenAreas.map((area) =>
      pageRecord(tokenAreaHref(defaultTokenBrand, area.id), area.label, 'Tokens', area.summary),
    ),
    pageRecord(
      '/components/',
      'Components',
      'Components',
      'React components from @earendil-works/elanor-react, built on Base UI and styled with the design tokens.',
    ),
    ...(await componentRecords()),
  ];
  const index = new MiniSearch<DocsSearchRecord>(docsSearchOptions);
  index.addAll(records);
  return new Response(JSON.stringify(index), {
    headers: {'Content-Type': 'application/json; charset=utf-8'},
  });
};
