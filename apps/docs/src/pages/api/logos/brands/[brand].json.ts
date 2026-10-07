import type {APIRoute, GetStaticPaths} from 'astro';
import {json, logoBrands} from '../../../../lib/api.ts';

export const getStaticPaths = (async () =>
  (await logoBrands()).map((brand) => ({params: {brand: brand.id}, props: {brand}}))) satisfies GetStaticPaths;

export const GET: APIRoute<{brand: Awaited<ReturnType<typeof logoBrands>>[number]}> = ({props}) => json(props.brand);
