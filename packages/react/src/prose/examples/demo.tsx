import {
  Blockquote,
  CodeSnippet,
  Heading,
  InlineCode,
  Link,
  List,
  Prose,
  Strong,
  Text,
} from '@earendil-works/elanor-react';

export default function ProseDemo() {
  return (
    <Prose>
      <Heading level={2} size={2}>
        Deploy a project
      </Heading>
      <Text>
        Every project deploys from its default branch. Connect a repository first, then choose the
        branch in <Link href="#">project settings</Link>.
      </Text>
      <List.Root render={<ol />}>
        <List.Item>Install the command-line tool.</List.Item>
        <List.Item>
          Sign in with <InlineCode>acme login</InlineCode>.
        </List.Item>
        <List.Item>Run the deploy command from the project folder.</List.Item>
      </List.Root>
      <CodeSnippet>acme deploy --prod</CodeSnippet>
      <Heading level={3} size={3}>
        Rollbacks
      </Heading>
      <Text>
        A deploy that fails its checks <Strong>never replaces</Strong> the running version.
      </Text>
      <Blockquote>
        <Text>We roll back by deploying the previous commit again; nothing else changes.</Text>
      </Blockquote>
      <Text>Deploys keep their logs for 30 days.</Text>
    </Prose>
  );
}
