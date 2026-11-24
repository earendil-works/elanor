import {getEntry} from 'astro:content';

/** The application setup guide, `packages/react/docs/application-setup.mdx`. */
export async function applicationSetup() {
  const entry = await getEntry('guides', 'application-setup');
  if (!entry) throw new Error('packages/react/docs/application-setup.mdx is missing.');
  return entry;
}
