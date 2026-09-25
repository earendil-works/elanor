import type {APIRoute, GetStaticPaths} from 'astro';
import {text, tokenBrands, tokensCss} from '../../../lib/api.ts';

export const getStaticPaths = (() => tokenBrands.map((brand) => ({params: {brand}}))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({params}) => text(await tokensCss(params.brand!), 'text/css');
