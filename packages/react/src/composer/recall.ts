import {useCallback, useRef, type KeyboardEvent} from 'react';

import {useComposerMeta} from './context.ts';
import {valueLength, type ComposerChip, type ComposerValue} from './editor/model.ts';

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
  entries: readonly ComposerValue<T>[],
  {from = 'first-line'}: ComposerRecallOptions = {},
): (event: KeyboardEvent<HTMLElement>) => void {
  const {editor} = useComposerMeta('Composer.useRecall');
  // The entry shown, while the editor is still recalling.
  const shown = useRef(0);
  return useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const key = event.nativeEvent;
      const edge = editor.recallEdge(key);
      if (!edge) return;
      const recalling = editor.recalling();
      if (
        !recalling &&
        (edge === 'down' || (from === 'empty' && valueLength(editor.getValue()) > 0))
      )
        return;
      let index = recalling ? Math.min(shown.current, entries.length) : entries.length;
      let entry: ComposerValue<T> | undefined;
      do {
        index += edge === 'up' ? -1 : 1;
        entry = entries[index];
      } while (entry && editor.shows(entry));
      if (!entry && edge === 'up') return;
      event.preventDefault();
      if (!entry) editor.recallDraft(key);
      else if (editor.recall(entry, key)) shown.current = index;
    },
    [editor, entries, from],
  );
}
