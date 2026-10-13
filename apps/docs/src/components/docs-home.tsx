import {ArrowForwardIcon} from '@earendil-works/elanor-icons-react';
import {
  Button,
  Container,
  Layout,
  Link,
  PageHeader,
  Separator,
  Stack,
  Text,
} from '@earendil-works/elanor-react';

import styles from './docs-home.module.css';

const destinations = [
  {
    id: 'components',
    href: '/components/layout/',
    title: 'Component library',
    description: 'Layouts, controls, and implementation examples.',
  },
  {
    id: 'icons',
    href: '/icons/',
    title: 'Icons',
    description: 'Browse and find icons.',
  },
  {
    id: 'brand',
    href: '/brand/',
    title: 'Brand assets',
    description: 'Browse and download brand logos.',
  },
] as const;

export function DocsHome({signedIn}: {readonly signedIn: boolean}) {
  const visibleDestinations = signedIn
    ? destinations
    : destinations.filter((destination) => destination.id === 'brand');
  return (
    <Layout.Root className={styles.home}>
      <Link href="#main" className={styles.skipLink}>
        Skip to content
      </Link>
      <Layout.Header className={styles.header}>
        <Container className={styles.container}>
          <Stack direction="row" align="center" gap="auto" wrap="wrap">
            <Link href="/" aria-label="Elanor home" className={styles.identity}>
              Elanor
            </Link>
            {signedIn ? (
              <form method="post" action="/auth/logout" data-astro-reload>
                <Button type="submit" hierarchy="tertiary" className={styles.signOut}>
                  Sign out
                </Button>
              </form>
            ) : (
              <Link href="/auth/login" data-astro-reload>
                Sign in
              </Link>
            )}
          </Stack>
        </Container>
      </Layout.Header>
      <Layout.Main id="main" tabIndex={-1} className={styles.main}>
        <Container className={styles.container}>
          <Stack gap="xLarge" align="stretch">
            <PageHeader.Root>
              <PageHeader.Title level={1}>Design system</PageHeader.Title>
              <PageHeader.Description className={styles.description}>
                {signedIn
                  ? 'Components and resources for Earendil products.'
                  : 'Logos and brand guidelines for Earendil products.'}
              </PageHeader.Description>
            </PageHeader.Root>
            <nav aria-label="Design system resources">
              <ul className={styles.destinations}>
                {visibleDestinations.map((destination, index) => (
                  <li key={destination.id}>
                    <Link
                      href={destination.href}
                      className={styles.resourceLink}
                      aria-labelledby={`${destination.id}-title`}
                      aria-describedby={`${destination.id}-description`}
                    >
                      <Stack gap="small" className={styles.resourceText}>
                        <Text
                          render={<span />}
                          id={`${destination.id}-title`}
                          className={styles.resourceTitle}
                        >
                          {destination.title}
                        </Text>
                        <Text
                          render={<span />}
                          id={`${destination.id}-description`}
                          className={styles.description}
                        >
                          {destination.description}
                        </Text>
                      </Stack>
                      <ArrowForwardIcon aria-hidden="true" className={styles.arrow} />
                    </Link>
                    {index < visibleDestinations.length - 1 ? (
                      <Separator aria-hidden="true" />
                    ) : null}
                  </li>
                ))}
              </ul>
            </nav>
          </Stack>
        </Container>
      </Layout.Main>
    </Layout.Root>
  );
}
