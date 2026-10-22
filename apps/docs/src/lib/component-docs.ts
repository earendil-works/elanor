import {resolve} from 'node:path';

import type {CollectionEntry} from 'astro:content';

import {orderedApi, partSummary} from './component-api.ts';
import {componentName} from './component-name.ts';
import {assertDemoSyntax, demoBlock, demoFiles} from './demo-blocks.ts';

/*
 * Component pages as Markdown for agents: the same text as the HTML page, with each
 * demo replaced by its source and the API tables appended.
 */

type Entry = CollectionEntry<'components'>;

const fence = /^```[\s\S]*?^```$/gm;

/** The first paragraph after the H1, as plain text. */
export function componentDescription(entry: Entry): string {
  const body = entry.body ?? '';
  const paragraph = /^# .+\n\n([\s\S]+?)(?:\n\n|$)/m.exec(body)?.[1];
  if (!paragraph || paragraph.startsWith('<')) {
    throw new Error(`${entry.id}: start the page with an H1 and a one-paragraph description.`);
  }
  return paragraph.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ');
}

export function componentMarkdown(entry: Entry): string {
  const body = entry.body ?? '';
  const mdxPath = resolve(process.cwd(), entry.filePath ?? '');
  assertDemoSyntax(body, entry.id);
  componentDescription(entry);

  const prose = body.replace(fence, '');
  const stray = /^(?:import |export |<(?!Demo )[A-Za-z])/m.exec(prose);
  if (stray) {
    throw new Error(
      `${entry.id}: use <Demo example="./examples/name.tsx" /> for live previews, not "${stray[0]}".`,
    );
  }

  const markdown = body
    .replace(demoBlock, (_, example: string) =>
      demoFiles(mdxPath, example)
        .map((file) => {
          const language = file.name.endsWith('.css') ? 'css' : 'tsx';
          const comment = language === 'css' ? `/* ${file.name} */` : `// ${file.name}`;
          return `\`\`\`${language}\n${comment}\n${file.code.trimEnd()}\n\`\`\``;
        })
        .join('\n\n'),
    )
    .replace(/\]\(\/components\/([\w-]+)\/(#[\w-]+)?\)/g, '](/components/$1.md$2)');

  return `${markdown.trimEnd()}\n${apiMarkdown(entry)}`;
}

function apiMarkdown(entry: Entry): string {
  const parts = orderedApi(entry.id, entry.body ?? '');
  if (!parts.length) return '';
  const cell = (value: string) => value.replaceAll('|', '\\|');
  const code = (value: string) => `\`${cell(value)}\``;
  const sections = parts.map((part) => {
    const rows = part.props.map(
      (prop) =>
        `| ${code(prop.name)}${prop.required ? ' (required)' : ''} | ${code(prop.type)} | ${prop.defaultValue ? code(prop.defaultValue) : '-'} | ${cell(prop.description ?? '')} |`,
    );
    const table = rows.length
      ? `| Prop | Type | Default | Description |\n| --- | --- | --- | --- |\n${rows.join('\n')}\n\n`
      : '';
    const summary = partSummary(part).replace(
      /\((https:\/\/base-ui\.com\/react\/components\/[\w-]+)(?:#[\w-]+)?\)/,
      '($1.md)',
    );
    const description = part.description ? `${part.description}\n\n` : '';
    return `### \`${part.name}\`\n\n${description}${table}${summary}`;
  });
  return `\n## API\n\n${sections.join('\n\n')}\n`;
}

/** The llms.txt list entry for a component page. */
export function componentIndexLine(entry: Entry): string {
  return `- [${componentName(entry.id)}](/components/${entry.id}.md): ${componentDescription(entry)}`;
}
