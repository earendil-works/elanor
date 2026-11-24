import {Link, Text} from '@earendil-works/elanor-react';

// Demo only; in your code, the links point to real URLs.
export default function TextProse() {
  return (
    <div data-text-context="prose">
      <Text>
        Long-form content such as documentation uses the prose style. Read the{' '}
        <Link href="#">onboarding guide</Link> before your first project.
      </Text>
    </div>
  );
}
