import type {APIRoute, GetStaticPaths} from 'astro';
import {json, tokenBrands, tokenIndex} from '../../../../lib/api.ts';

export const getStaticPaths = (async () => (await tokenBrands()).map((brand) => ({params: {brand}}))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({params}) => json(await tokenIndex(params.brand!), {compact: true});
