import type {APIRoute} from 'astro';

import {json, logoIndex} from '../../../lib/api.ts';

export const GET: APIRoute = async () => json(await logoIndex());
