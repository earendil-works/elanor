import {Container} from '../container/container.tsx';
import {Heading} from '../heading/heading.tsx';
import {Link} from '../link/link.tsx';
import {Page} from '../page/page.tsx';
import {SideNavigation} from '../side-navigation/side-navigation.tsx';
import {TableOfContents, TableOfContentsItem, TableOfContentsLink} from '../table-of-contents/table-of-contents.tsx';
import {Text} from '../text/text.tsx';
import {Layout} from './layout.tsx';

export function LayoutExample() {
  return (
    <Layout.Root style={{minBlockSize: 0, inlineSize: '100%'}}>
      <Layout.Header>
        <Container><Link href="/">Elanor documentation</Link></Container>
      </Layout.Header>
      <Container render={<Layout.Body />}>
        <Layout.Aside aria-label="Documentation sections" style={{padding: 'var(--semantic-dimension-space-padding-medium)'}}>
          <SideNavigation.Root aria-label="Documentation">
            <SideNavigation.Group>
              <SideNavigation.GroupLabel>Foundations</SideNavigation.GroupLabel>
              <SideNavigation.List>
                <SideNavigation.Item><SideNavigation.Link href="/components/layout/" active>Layout</SideNavigation.Link></SideNavigation.Item>
                <SideNavigation.Item><SideNavigation.Link href="/components/container/">Container</SideNavigation.Link></SideNavigation.Item>
                <SideNavigation.Item><SideNavigation.Link href="/components/button/">Button</SideNavigation.Link></SideNavigation.Item>
              </SideNavigation.List>
            </SideNavigation.Group>
          </SideNavigation.Root>
        </Layout.Aside>
        <Layout.Main>
          <Container style={{maxInlineSize: 'var(--semantic-dimension-size-content-small)'}}>
            <Page>
              <Heading level={2} size={2} id="layout-overview">Page composition</Heading>
              <Text>Navigation and the table of contents are independent side regions. Reading content is centered in the space between them.</Text>
              <Heading level={3} id="layout-details">Content ownership</Heading>
              <Text>Replace these ordinary children with your own page content. No navigation component or content grid is required by Layout.</Text>
            </Page>
          </Container>
        </Layout.Main>
        <Layout.Aside aria-label="Page outline" style={{padding: 'var(--semantic-dimension-space-padding-medium)'}}>
          <TableOfContents>
            <TableOfContentsItem><TableOfContentsLink href="#layout-overview">Page composition</TableOfContentsLink></TableOfContentsItem>
            <TableOfContentsItem><TableOfContentsLink href="#layout-details">Content ownership</TableOfContentsLink></TableOfContentsItem>
          </TableOfContents>
        </Layout.Aside>
      </Container>
      <Layout.Footer><Container><Text>Elanor documentation</Text></Container></Layout.Footer>
    </Layout.Root>
  );
}
