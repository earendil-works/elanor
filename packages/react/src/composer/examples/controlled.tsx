import {Composer, SegmentedControl, Stack, type ComposerValue} from '@earendil-works/elanor-react';
import {useState, type ReactNode} from 'react';

import styles from './composer.module.css';

const toText = (value: ComposerValue) => Composer.toText(value, (chip) => chip.label);

type Conversation = 'design' | 'release';

const initial = {
  design: ['Can we keep the hairline border?'],
  release: [],
} satisfies Record<Conversation, ComposerValue>;

/** Owns the drafts. Typing renders this and the prompt, not `children`. */
function Drafts({draft, children}: {draft: Conversation; children: ReactNode}) {
  const [drafts, setDrafts] = useState<Record<Conversation, ComposerValue>>(initial);
  return (
    <Composer.Root
      toText={toText}
      historyKey={draft}
      value={drafts[draft]}
      onValueChange={(value) => setDrafts((current) => ({...current, [draft]: value}))}
    >
      {children}
    </Composer.Root>
  );
}

export default function ComposerControlled() {
  const [conversation, setConversation] = useState<Conversation[]>(['design']);

  return (
    <Stack gap="small" align="stretch">
      <SegmentedControl.Root
        aria-label="Conversation"
        value={conversation}
        onValueChange={(next) => {
          if (next.length > 0) setConversation(next);
        }}
      >
        <SegmentedControl.Item value="design">Design review</SegmentedControl.Item>
        <SegmentedControl.Item value="release">Release notes</SegmentedControl.Item>
      </SegmentedControl.Root>
      <Drafts draft={conversation[0] ?? 'design'}>
        <Composer.Panel>
          <Composer.InputGroup>
            <Composer.Prompt aria-label="Message" placeholder="Write a message…" />
            <Composer.Controls className={styles.end}>
              <Composer.Submit />
            </Composer.Controls>
          </Composer.InputGroup>
        </Composer.Panel>
      </Drafts>
    </Stack>
  );
}
