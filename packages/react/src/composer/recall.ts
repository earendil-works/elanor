import {useCallback, type KeyboardEvent} from 'react';

import {useComposerMeta} from './context.ts';
import type {ComposerChip, ComposerValue} from './editor/model.ts';

/** `first-line`: ArrowUp recalls from anywhere on the first line. `empty`: only from an empty prompt. */
export type ComposerRecallFrom = 'first-line' | 'empty';

export interface ComposerRecallOptions {
  /** Where ArrowUp starts recalling; once it has, it goes on from the message shown. */
  readonly from?: ComposerRecallFrom | undefined;
}

/**
 * Lets a person bring back earlier messages with ArrowUp on the prompt's first line, and go
 * forward again with ArrowDown on its last, back to their draft after the newest. Returns the
 * handler for `Composer.Prompt`'s `onKeyDown`. Pass the messages oldest first, with chips as they
 * were sent. Messages equal to the text are skipped. An edit makes the message shown the draft.
 * Throws outside `Composer.Root`.
 */
export function useRecall<T extends ComposerChip = ComposerChip>(
  messages: readonly ComposerValue<T>[],
  {from = 'first-line'}: ComposerRecallOptions = {},
): (event: KeyboardEvent<HTMLElement>) => void {
  const {editor} = useComposerMeta('Composer.useRecall');
  return useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (editor.recallKey(event.nativeEvent, messages, from)) event.preventDefault();
    },
    [editor, messages, from],
  );
}
