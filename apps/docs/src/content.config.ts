import {glob} from 'astro/loaders';
import {z} from 'astro/zod';
import {defineCollection} from 'astro:content';

const components = defineCollection({
  loader: glob({
    pattern: '*/*.mdx',
    base: '../../packages/react/src',
    generateId: ({entry}) => entry.split('/')[0] ?? entry,
  }),
  schema: z.object({}),
});

export const collections = {components};
