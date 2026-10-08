import type {APIRoute} from 'astro';

import {iconIndex, json} from '../../../lib/api.ts';

export const GET: APIRoute = async () => json(await iconIndex(), {compact: true});
