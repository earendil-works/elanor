import type {APIRoute, GetStaticPaths} from 'astro';
import {type ApiIcon, json, loadIcons} from '../../../lib/api.ts';

export const getStaticPaths = (async () =>
  (await loadIcons()).map((icon) => ({params: {name: icon.name}, props: {icon}}))) satisfies GetStaticPaths;

export const GET: APIRoute<{icon: ApiIcon}> = ({props}) => json(props.icon);
