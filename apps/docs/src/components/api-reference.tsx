import {
  CodeSnippet,
  CopyButton,
  HighlightedCode,
  InlineCode,
  LinkedHeading,
  Link,
  Table,
  Text,
  type HighlightedLines,
} from '@earendil-works/elanor-react';
import {Fragment, type ReactNode} from 'react';

import {
  functionSummary,
  partSummary,
  typeDeclarations,
  type ApiPart,
  type ComponentApi,
} from '../lib/component-api.ts';

/** The id of a part's or function's heading, such as `api-modal-root`. */
export const apiId = (item: {readonly name: string}) =>
  `api-${item.name.toLowerCase().replace('.', '-')}`;

/** The id of the heading of the page's types. */
export const apiTypesId = 'api-types';

/** The API's headings below `## API`, for the table of contents. */
export function apiHeadings(api: ComponentApi): {readonly id: string; readonly title: string}[] {
  return [
    ...[...api.parts, ...api.functions].map((item) => ({id: apiId(item), title: item.name})),
    ...(api.types.length ? [{id: apiTypesId, title: 'Types'}] : []),
  ];
}

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
  /** The page's API, in the order the page introduces it. */
  readonly api: ComponentApi;
  /** The API's signatures and type declarations, highlighted. */
  readonly code: ReadonlyMap<string, HighlightedLines>;
}

/** The props, functions and types of a component page, read from their TypeScript types. */
export function ApiReference({api, code}: ApiReferenceProps): React.JSX.Element | null {
  if (api.parts.length === 0 && api.functions.length === 0) return null;
  const snippet = (source: string, label: string) => {
    const lines = code.get(source);
    if (!lines) throw new Error(`Highlight the API's code first: ${source}`);
    return (
      <CodeSnippet data-language="ts" actions={<CopyButton value={source} aria-label={label} />}>
        <HighlightedCode lines={lines} />
      </CodeSnippet>
    );
  };
  return (
    <>
      <LinkedHeading level={2} size={2} id="api" linkLabel="Copy link to API">
        API
      </LinkedHeading>
      {api.parts.map((part) => (
        <Part key={part.name} part={part} />
      ))}
      {api.functions.map((item) => (
        <Fragment key={item.name}>
          <ApiHeading id={apiId(item)} name={item.name} />
          {'baseUi' in item ? (
            <Text>{inline(functionSummary(item.baseUi))}</Text>
          ) : (
            <>
              {snippet(item.signature, `Copy the signature of ${item.name}`)}
              {item.description ? <Text>{inline(item.description)}</Text> : null}
            </>
          )}
        </Fragment>
      ))}
      {api.types.length > 0 ? (
        <>
          <LinkedHeading level={3} size={3} id={apiTypesId} linkLabel="Copy link to Types">
            Types
          </LinkedHeading>
          {snippet(typeDeclarations(api), 'Copy the types')}
        </>
      ) : null}
    </>
  );
}

function ApiHeading({id, name}: {readonly id: string; readonly name: string}) {
  return (
    <LinkedHeading level={3} size={3} id={id} linkLabel={`Copy link to ${name}`}>
      <InlineCode variant="plain">{name}</InlineCode>
    </LinkedHeading>
  );
}

function Part({part}: {readonly part: ApiPart}) {
  const summary = partSummary(part);
  return (
    <>
      <ApiHeading id={apiId(part)} name={part.name} />
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
                  <Table.Cell data-label="Default" data-empty={prop.defaultValue ? undefined : ''}>
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
      {summary ? <Text>{inline(summary)}</Text> : null}
    </>
  );
}
