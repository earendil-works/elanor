import {
  Container,
  Heading,
  Layout,
  Link,
  Page,
  SideNavigation,
  TableOfContents,
  Text,
} from '@earendil-works/elanor-react';

const asidePadding = {padding: 'var(--semantic-dimension-space-padding-medium)'};

export default function LayoutDemo() {
  return (
    // minBlockSize: 0 fits the layout into this demo; omit it on a page.
    <Layout.Root style={{minBlockSize: 0}}>
      <Layout.Header>
        <Container>
          <Link href="#">Acme handbook</Link>
        </Container>
      </Layout.Header>
      <Container render={<Layout.Body />}>
        <Layout.Aside aria-label="Handbook sections" style={asidePadding}>
          <SideNavigation.Root aria-label="Handbook">
            <SideNavigation.List>
              <SideNavigation.Item>
                <SideNavigation.Link href="#" active>
                  Onboarding
                </SideNavigation.Link>
              </SideNavigation.Item>
              <SideNavigation.Item>
                <SideNavigation.Link href="#">Policies</SideNavigation.Link>
              </SideNavigation.Item>
            </SideNavigation.List>
          </SideNavigation.Root>
        </Layout.Aside>
        <Layout.Main>
          <Container
            style={{maxInlineSize: 'var(--semantic-dimension-size-max-width-content-small)'}}
          >
            <Page>
              <Heading level={2} size={4} id="first-week">
                Your first week
              </Heading>
              <Text>Meet your team, set up your accounts, and pick a starter project.</Text>
              <Heading level={3} id="accounts">
                Accounts
              </Heading>
              <Text>Ask your manager for access to the workspace and the design files.</Text>
            </Page>
          </Container>
        </Layout.Main>
        <Layout.Aside aria-label="On this page" style={asidePadding}>
          <TableOfContents.Root>
            <TableOfContents.Item>
              <TableOfContents.Link href="#first-week">Your first week</TableOfContents.Link>
            </TableOfContents.Item>
            <TableOfContents.Item>
              <TableOfContents.Link href="#accounts">Accounts</TableOfContents.Link>
            </TableOfContents.Item>
          </TableOfContents.Root>
        </Layout.Aside>
      </Container>
      <Layout.Footer>
        <Container>
          <Text>Acme handbook</Text>
        </Container>
      </Layout.Footer>
    </Layout.Root>
  );
}
