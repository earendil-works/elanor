import type {APIRoute, GetStaticPaths} from 'astro';
import {getCollection, type CollectionEntry} from 'astro:content';

import {text} from '../../lib/api.ts';
import {componentMarkdown} from '../../lib/component-docs.ts';

export const getStaticPaths = (async () =>
  (await getCollection('components')).map((entry) => ({
    params: {component: entry.id},
    props: {entry},
  }))) satisfies GetStaticPaths;

export const GET: APIRoute<{entry: CollectionEntry<'components'>}> = ({props}) =>
  text(componentMarkdown(props.entry), 'text/markdown');
