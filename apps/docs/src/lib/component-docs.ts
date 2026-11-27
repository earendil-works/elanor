import {resolve} from 'node:path';

import type {CollectionEntry} from 'astro:content';

import {functionSummary, orderedApi, partSummary, typeDeclarations} from './component-api.ts';
import {componentName} from './component-name.ts';
import {assertDemoSyntax, demoBlock, demoFiles} from './demo-blocks.ts';
import {firstParagraph} from './docs-wording.ts';

/*
 * Component pages as Markdown for agents: the same text as the HTML page, with each
 * demo replaced by its source and the API appended. Each example file appears once, named by its
 * path from the page, as excerpts name it: `./examples/demo.tsx`.
 */

type Entry = CollectionEntry<'components'>;

const fence = /^```[\s\S]*?^```$/gm;

/** The first paragraph after the H1, as plain text. */
export function componentDescription(entry: Entry): string {
  const paragraph = firstParagraph(entry.body ?? '');
  if (!paragraph) {
    throw new Error(`${entry.id}: start the page with an H1 and a one-paragraph description.`);
  }
  return paragraph;
}

/** Points the docs' HTML links at their Markdown versions. */
export function markdownLinks(markdown: string): string {
  return markdown
    .replace(/\]\(\/components\/([\w-]+)\/(#[\w-]+)?\)/g, '](/components/$1.md$2)')
    .replace(/\]\(\/application-setup\/(#[\w-]+)?\)/g, '](/application-setup.md$1)');
}

const preamble =
  '> From `@earendil-works/elanor-react`. Set up first: [Application setup](/application-setup.md). Index and rules: [llms.txt](/llms.txt).';

export function componentMarkdown(entry: Entry): string {
  const body = entry.body ?? '';
  const mdxPath = resolve(process.cwd(), entry.filePath ?? '');
  assertDemoSyntax(body, entry.id);

  const prose = body.replace(fence, '');
  const stray = /^(?:import |export |<(?!Demo )[A-Za-z])/m.exec(prose);
  if (stray) {
    throw new Error(
      `${entry.id}: use <Demo example="./examples/name.tsx" /> for live previews, not "${stray[0]}".`,
    );
  }

  const shown = new Set<string>();
  const markdown = body.replace(demoBlock, (_, example: string) => {
    const files = demoFiles(mdxPath, example);
    const repeated = files.filter((file) => shown.has(file.path));
    const fences = files
      .filter((file) => !shown.has(file.path))
      .map((file) => {
        shown.add(file.path);
        const language = file.name.endsWith('.css') ? 'css' : 'tsx';
        const comment = language === 'css' ? `/* ${file.specifier} */` : `// ${file.specifier}`;
        return `\`\`\`${language}\n${comment}\n${file.code.trimEnd()}\n\`\`\``;
      });
    const names = repeated.map((file) => `\`${file.specifier}\``).join(', ');
    return [...fences, ...(names ? [`Uses ${names}, shown above.`] : [])].join('\n\n');
  });

  return `${preamble}\n\n${markdownLinks(markdown).trimEnd()}\n${apiMarkdown(entry)}`;
}

/** Points links to Base UI at its Markdown pages, which have no anchors for sections. */
const baseUiMarkdown = (markdown: string) =>
  markdown.replace(
    /\((https:\/\/base-ui\.com\/react\/components\/[\w-]+)(?:#[\w-]+)?\)/g,
    '($1.md)',
  );

function apiMarkdown(entry: Entry): string {
  const api = orderedApi(entry.id, entry.body ?? '');
  if (!api.parts.length && !api.functions.length) return '';
  const cell = (value: string) => value.replaceAll('|', '\\|');
  const code = (value: string) => `\`${cell(value)}\``;
  const parts = api.parts.map((part) => {
    const rows = part.props.map(
      (prop) =>
        `| ${code(prop.name)}${prop.required ? ' (required)' : ''} | ${code(prop.type)} | ${prop.defaultValue ? code(prop.defaultValue) : '-'} | ${cell(prop.description ?? '')} |`,
    );
    const table = rows.length
      ? `| Prop | Type | Default | Description |\n| --- | --- | --- | --- |\n${rows.join('\n')}`
      : undefined;
    return [`### \`${part.name}\``, part.description, table, partSummary(part)]
      .filter(Boolean)
      .join('\n\n');
  });
  const functions = api.functions.map((item) =>
    'baseUi' in item
      ? `### \`${item.name}\`\n\n${functionSummary(item.baseUi)}`
      : [`### \`${item.name}\``, `\`\`\`ts\n${item.signature}\n\`\`\``, item.description]
          .filter(Boolean)
          .join('\n\n'),
  );
  const types = api.types.length ? [`### Types\n\n\`\`\`ts\n${typeDeclarations(api)}\n\`\`\``] : [];
  return baseUiMarkdown(`\n## API\n\n${[...parts, ...functions, ...types].join('\n\n')}\n`);
}

/** The llms.txt list entry for a component page. */
export function componentIndexLine(entry: Entry): string {
  return `- [${componentName(entry.id)}](/components/${entry.id}.md): ${componentDescription(entry)}`;
}
