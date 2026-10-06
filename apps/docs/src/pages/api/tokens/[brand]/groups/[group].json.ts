import type {APIRoute, GetStaticPaths} from 'astro';
import {type ApiTokenGroup, json, loadTokenGroups, tokenBrands} from '../../../../../lib/api.ts';

// One file per token group, e.g. /api/tokens/radius/groups/semantic.color.text.json
export const getStaticPaths = (async () => {
  const paths = [];
  for (const brand of await tokenBrands()) {
    for (const group of await loadTokenGroups(brand)) paths.push({params: {brand, group: group.path}, props: {group}});
  }
  return paths;
}) satisfies GetStaticPaths;

export const GET: APIRoute<{group: ApiTokenGroup}> = ({props, params}) => json({brand: params.brand, ...props.group});
