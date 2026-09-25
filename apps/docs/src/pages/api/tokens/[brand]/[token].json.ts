import type {APIRoute, GetStaticPaths} from 'astro';
import {type ApiToken, json, loadTokens, tokenBrands} from '../../../../lib/api.ts';

// One file per token, e.g. /api/tokens/radius/semantic.color.text.primary.json
export const getStaticPaths = (async () => {
  const paths = [];
  for (const brand of tokenBrands) {
    for (const token of await loadTokens(brand)) paths.push({params: {brand, token: token.name}, props: {token}});
  }
  return paths;
}) satisfies GetStaticPaths;

export const GET: APIRoute<{token: ApiToken}> = ({props, params}) => json({brand: params.brand, ...props.token});
