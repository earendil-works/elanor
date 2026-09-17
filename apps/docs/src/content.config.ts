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

export const collections = {components};
