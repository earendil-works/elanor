import {KeyboardKey, KeyboardShortcut, Text} from '@earendil-works/elanor-react';

export default function KeyboardShortcutDemo() {
  return (
    <Text>
      Press{' '}
      <KeyboardShortcut>
        <KeyboardKey>Ctrl</KeyboardKey>+<KeyboardKey>K</KeyboardKey>
      </KeyboardShortcut>{' '}
      to search.
    </Text>
  );
}
