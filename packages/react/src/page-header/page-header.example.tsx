import {Link, PageHeader} from '@earendil-works/elanor-react';

export function PageHeaderExample(): React.JSX.Element {
  return (
    <PageHeader.Root>
      <PageHeader.Row>
        <PageHeader.Title level={1}>Component library</PageHeader.Title>
        <PageHeader.Actions>
          <Link href="/components/button">Buttons</Link>
          <Link href="/components/input">Inputs</Link>
        </PageHeader.Actions>
      </PageHeader.Row>
      {/* The original MDX nested a paragraph in Description. Preserve the browser's
          parsed sibling paragraphs, not invalid nesting that breaks hydration. */}
      <PageHeader.Description />
      <p>Explore controls, navigation, and layouts for your application.</p>
      <p />
    </PageHeader.Root>
  );
}
