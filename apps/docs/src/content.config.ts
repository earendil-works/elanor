import {defineCollection, z} from 'astro:content';
import {glob} from 'astro/loaders';

const components = defineCollection({
  loader: glob({
    pattern: '*/*.mdx',
    base: '../../packages/react/src',
    generateId: ({entry}) => entry.split('/')[0] ?? entry,
  }),
  schema: z.object({}),
});

// The brand guidelines live with the logos, which also ship them in the press kits.
const guidelines = defineCollection({
  loader: glob({pattern: 'BRAND-GUIDELINES.md', base: '../../packages/logos/guidelines'}),
  schema: z.object({}),
});

export const collections = {components, guidelines};
