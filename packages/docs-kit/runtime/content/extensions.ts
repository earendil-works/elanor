/*
 * Python-Markdown's tabs and admonitions, which MkDocs and Zensical sites use, so their Markdown
 * moves over unchanged:
 *
 *     === "TypeScript"            !!! warning "Title"          ??? note "Title"
 *
 *         Indented content.           Indented content.            Collapsed content.
 *
 * Before parsing, each becomes HTML around its (dedented) Markdown, which CommonMark parses as
 * Markdown again between the tags: `<div data-tab="TypeScript">`, `<div data-admonition="warning"
 * data-title="Title">`, and `<details data-admonition="note">`. `markdown.ts` gives them their final
 * markup.
 */

const fence = /^(`{3,}|~{3,})/;
const tabHeader = /^===(\+?)[ \t]+"(.*)"[ \t]*$/;
const admonitionHeader = /^(!!!|\?\?\?\+?)[ \t]+([\w-]+)(?:[ \t]+"(.*)")?[ \t]*$/;

function escapeAttribute(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function isIndented(line: string): boolean {
  return line.startsWith('    ') || line.startsWith('\t');
}

function dedent(line: string): string {
  return line.startsWith('\t') ? line.slice(1) : line.slice(4);
}

/** The indented block after a header line at `start`: its lines, dedented, and where it ends. */
function indentedBlock(lines: readonly string[], start: number): {body: string[]; end: number} {
  const body: string[] = [];
  let end = start;
  while (end < lines.length) {
    const line = lines[end] ?? '';
    if (line.trim() === '') body.push('');
    else if (isIndented(line)) body.push(dedent(line));
    else break;
    end += 1;
  }
  // Trailing blank lines belong to what follows.
  while (body.length > 0 && body.at(-1) === '') {
    body.pop();
    end -= 1;
  }
  return {body, end};
}

/** Rewrites tabs and admonitions as HTML around their Markdown, leaving fenced code alone. */
export function preprocessMarkdown(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  const out: string[] = [];
  let openFence: string | undefined;
  let index = 0;
  while (index < lines.length) {
    const line = lines[index] ?? '';
    const fenceMatch = fence.exec(line);
    if (openFence) {
      out.push(line);
      if (fenceMatch && line.trim().startsWith(openFence)) openFence = undefined;
      index += 1;
      continue;
    }
    if (fenceMatch) {
      openFence = fenceMatch[1];
      out.push(line);
      index += 1;
      continue;
    }

    if (tabHeader.test(line)) {
      // A set of tabs: headers with their indented content, separated by blank lines.
      out.push('<div data-tabs>', '');
      while (index < lines.length) {
        const header = tabHeader.exec(lines[index] ?? '');
        if (!header) break;
        const {body, end} = indentedBlock(lines, index + 1);
        out.push(
          `<div data-tab="${escapeAttribute(header[2] ?? '')}">`,
          '',
          preprocessMarkdown(body.join('\n')),
          '',
          '</div>',
          '',
        );
        index = end;
        let next = index;
        while (next < lines.length && (lines[next] ?? '').trim() === '') next += 1;
        if (!tabHeader.test(lines[next] ?? '')) break;
        index = next;
      }
      out.push('</div>', '');
      continue;
    }

    const admonition = admonitionHeader.exec(line);
    if (admonition) {
      const [, marker = '', type = '', title] = admonition;
      const {body, end} = indentedBlock(lines, index + 1);
      const titleAttribute = title === undefined ? '' : ` data-title="${escapeAttribute(title)}"`;
      const content = ['', preprocessMarkdown(body.join('\n')), ''];
      if (marker === '!!!') {
        out.push(
          `<div data-admonition="${escapeAttribute(type)}"${titleAttribute}>`,
          ...content,
          '</div>',
          '',
        );
      } else {
        const open = marker.endsWith('+') ? ' open' : '';
        out.push(
          `<details data-admonition="${escapeAttribute(type)}"${titleAttribute}${open}>`,
          ...content,
          '</details>',
          '',
        );
      }
      index = end;
      continue;
    }

    out.push(line);
    index += 1;
  }
  return out.join('\n');
}
