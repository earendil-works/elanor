import type {APIRoute, GetStaticPaths} from 'astro';
import {json, loadTokens, tokenBrands} from '../../../lib/api.ts';

export const getStaticPaths = (() => tokenBrands.map((brand) => ({params: {brand}}))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({params}) => json({brand: params.brand, tokens: await loadTokens(params.brand!)}, {compact: true});
