import {KeyboardKey, Text} from '@earendil-works/elanor-react';

export default function KeyboardShortcutSingleKey() {
  return (
    <Text>
      Press <KeyboardKey>Esc</KeyboardKey> to close the dialog, or <KeyboardKey>?</KeyboardKey> for
      all shortcuts.
    </Text>
  );
}
