import type {APIRoute, GetStaticPaths} from 'astro';

import {iconKeywords, json} from '../../../../lib/api.ts';

// One file per keyword, e.g. /api/icons/keywords/arrow.json, listing the icons whose name or tags contain it.
export const getStaticPaths = (async () =>
  [...(await iconKeywords())].map(([keyword, icons]) => ({
    params: {keyword},
    props: {icons},
  }))) satisfies GetStaticPaths;

export const GET: APIRoute<{icons: string[]}> = ({props, params}) =>
  json(
    {keyword: params.keyword, iconUrl: '/api/icons/{name}.json', icons: props.icons},
    {compact: true},
  );
