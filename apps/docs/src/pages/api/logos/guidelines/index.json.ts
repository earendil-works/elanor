import type {APIRoute} from 'astro';

import {guidelinesIndex, json} from '../../../../lib/api.ts';

export const GET: APIRoute = async () => json(await guidelinesIndex());
