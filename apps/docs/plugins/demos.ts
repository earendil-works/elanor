import type {Plugin} from 'vite';

import {assertDemos, demoBlock, demoFiles} from '../src/lib/demo-blocks.ts';

/**
 * Expands `<Demo example="./examples/name.tsx" />` in component MDX into a hydrated
 * example plus its raw source files, so each page shows the code it renders. Checks that code
 * fences quoting an example (```` ```tsx from="./examples/demo.tsx" ````) still match it.
 * `Demo` itself is supplied through the MDX `components` prop.
 */
export function demos(): Plugin {
  return {
    name: 'elanor-demos',
    enforce: 'pre',
    transform: {
      order: 'pre',
      filter: {id: /\.mdx$/},
      handler(code, id) {
        assertDemos(code, id);
        if (!code.includes('<Demo')) return;
        const imports: string[] = [];
        let count = 0;
        const body = code.replace(demoBlock, (_, example: string) => {
          const component = `DemoExample${count++}`;
          imports.push(`import ${component} from '${example}';`);
          const files = demoFiles(id, example).map((file, index) => {
            const source = `${component}File${index}`;
            this.addWatchFile(file.path);
            imports.push(`import ${source} from '${file.specifier}?raw';`);
            return `{name: ${JSON.stringify(file.name)}, code: ${source}}`;
          });
          return `<Demo files={[${files.join(', ')}]}>\n  <${component} client:load />\n</Demo>`;
        });
        // Front matter must stay at the start of the file, before the imports.
        const frontMatter = /^---\r?\n[\s\S]*?\r?\n---\r?\n/.exec(body)?.[0] ?? '';
        const content = body.slice(frontMatter.length);
        return {code: `${frontMatter}${imports.join('\n')}\n\n${content}`, map: null};
      },
    },
  };
}
