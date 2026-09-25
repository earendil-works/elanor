import type {APIRoute} from 'astro';
import {json, loadIcons} from '../../lib/api.ts';

export const GET: APIRoute = async () => json({icons: await loadIcons()}, {compact: true});
