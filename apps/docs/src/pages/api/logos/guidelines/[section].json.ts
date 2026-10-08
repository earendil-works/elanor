import type {APIRoute, GetStaticPaths} from 'astro';

import {type ApiGuidelinesSection, json, loadGuidelines} from '../../../../lib/api.ts';

// One file per guidelines section, e.g. /api/logos/guidelines/clear-space.json
export const getStaticPaths = (async () =>
  (await loadGuidelines()).sections.map((section) => ({
    params: {section: section.id},
    props: {section},
  }))) satisfies GetStaticPaths;

export const GET: APIRoute<{section: ApiGuidelinesSection}> = ({props}) => json(props.section);
