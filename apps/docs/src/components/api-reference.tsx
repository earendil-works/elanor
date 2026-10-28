import {InlineCode, LinkedHeading, Link, Table, Text} from '@earendil-works/elanor-react';
import {Fragment, type ReactNode} from 'react';

import {partSummary, type ApiPart} from '../lib/component-api.ts';

/** The id of a part's heading, such as `api-modal-root`. */
export const apiPartId = (part: ApiPart) => `api-${part.name.toLowerCase().replace('.', '-')}`;

const inlineMarkdown = /\[`([^`]+)`\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`/g;

/** The inline Markdown of summaries and descriptions (code spans and links) as components. */
function inline(markdown: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  for (const match of markdown.matchAll(inlineMarkdown)) {
    nodes.push(markdown.slice(last, match.index));
    const [, linkedCode, codeHref, label, href, code] = match;
    if (linkedCode !== undefined) {
      nodes.push(
        <Link key={match.index} href={codeHref}>
          <InlineCode>{linkedCode}</InlineCode>
        </Link>,
      );
    } else if (label !== undefined) {
      nodes.push(
        <Link key={match.index} href={href}>
          {label}
        </Link>,
      );
    } else {
      nodes.push(<InlineCode key={match.index}>{code}</InlineCode>);
    }
    last = match.index + match[0].length;
  }
  nodes.push(markdown.slice(last));
  return nodes;
}

interface ApiReferenceProps {
  /** The page's parts, in the order the page introduces them. */
  readonly parts: readonly ApiPart[];
}

/** The props of a component page's parts, read from their TypeScript types. */
export function ApiReference({parts}: ApiReferenceProps): React.JSX.Element | null {
  if (parts.length === 0) return null;
  return (
    <>
      <LinkedHeading level={2} size={2} id="api" linkLabel="Copy link to API">
        API
      </LinkedHeading>
      {parts.map((part) => (
        <Fragment key={part.name}>
          <LinkedHeading
            level={3}
            size={3}
            id={apiPartId(part)}
            linkLabel={`Copy link to ${part.name}`}
          >
            <InlineCode variant="plain">{part.name}</InlineCode>
          </LinkedHeading>
          {part.description ? <Text>{inline(part.description)}</Text> : null}
          {part.props.length > 0 ? (
            <Table.Container className="api-props">
              <Table.Root>
                <Table.Head>
                  <Table.Row>
                    <Table.HeaderCell scope="col">Prop</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Type</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Default</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Description</Table.HeaderCell>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {part.props.map((prop) => (
                    <Table.Row key={prop.name}>
                      <Table.HeaderCell scope="row">
                        <InlineCode variant="plain">{prop.name}</InlineCode>
                        {prop.required ? <span className="api-required">required</span> : null}
                      </Table.HeaderCell>
                      <Table.Cell data-label="Type">
                        <InlineCode variant="plain">{prop.type}</InlineCode>
                      </Table.Cell>
                      <Table.Cell
                        data-label="Default"
                        data-empty={prop.defaultValue ? undefined : ''}
                      >
                        {prop.defaultValue ? (
                          <InlineCode variant="plain">{prop.defaultValue}</InlineCode>
                        ) : (
                          '-'
                        )}
                      </Table.Cell>
                      <Table.Cell>{prop.description ? inline(prop.description) : null}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Table.Container>
          ) : null}
          <Text>{inline(partSummary(part))}</Text>
        </Fragment>
      ))}
    </>
  );
}
