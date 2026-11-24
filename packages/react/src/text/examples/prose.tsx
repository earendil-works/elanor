import {Link, Text} from '@earendil-works/elanor-react';

// Demo only: link to real URLs instead of `#`.
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
