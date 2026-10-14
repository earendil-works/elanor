import {AppLayout, Heading, Link, Page, Stack, Text} from '@earendil-works/elanor-react';

export function AppLayoutExample(): React.JSX.Element {
  return (
    <AppLayout.Root>
      <AppLayout.Header><Link href="/">Elanor</Link></AppLayout.Header>
      <AppLayout.Body>
        <AppLayout.Sidebar>
          <nav aria-label="Component shortcuts">
            <Stack gap="small">
              <Link href="/components/button">Buttons</Link>
              <Link href="/components/input">Inputs</Link>
            </Stack>
          </nav>
        </AppLayout.Sidebar>
        <AppLayout.Content>
          <Page>
            <Heading level={1} size={1}>Component library</Heading>
            <Text>Explore controls, navigation, and layouts for your application.</Text>
          </Page>
        </AppLayout.Content>
      </AppLayout.Body>
    </AppLayout.Root>
  );
}
