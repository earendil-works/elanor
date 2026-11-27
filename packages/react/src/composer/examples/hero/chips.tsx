import {ContentPasteIcon, DescriptionIcon, TerminalIcon} from '@earendil-works/elanor-icons-react';
import {Chip, Composer, Tooltip, type ComposerValue} from '@earendil-works/elanor-react';
import type {ReactNode} from 'react';

import {UploadChip} from './uploads.tsx';

import styles from '../composer.module.css';

/** What a chip in the message stands for. */
export type MessageChip =
  | {readonly kind: 'file'; readonly id: string; readonly label: string; readonly path: string}
  | {
      readonly kind: 'command';
      readonly id: string;
      readonly label: string;
      readonly description: string;
    }
  | {
      readonly kind: 'upload';
      readonly id: string;
      readonly label: string;
      readonly uploadId: string;
    }
  | {readonly kind: 'paste'; readonly id: string; readonly label: string; readonly text: string};

export type Message = ComposerValue<MessageChip>;

export const chipText = (chip: MessageChip) => {
  switch (chip.kind) {
    case 'file':
      return `@${chip.path}`;
    case 'command':
      return `/${chip.label}`;
    case 'upload':
      return `@uploads/${chip.label}`;
    case 'paste':
      return chip.text;
  }
};

// Root calls `toText` on an edit, so it reads nothing that changes without one.
export const toText = (value: Message) => Composer.toText(value, chipText);

/** More lines than the prompt shows at once. */
const MAX_LINES = 10;

export const getPastedValue = (text: string): Message => {
  const lines = text.split('\n').length;
  if (lines <= MAX_LINES) return [text];
  return [{kind: 'paste', id: crypto.randomUUID(), label: `${lines} lines`, text}];
};

// A pasted text is costly to lose: the first Backspace selects it. A file turns back into its
// `@path`, where the suggestions open on it again.
export const chipDeletion = (chip: MessageChip) =>
  chip.kind === 'paste' ? 'select' : chip.kind === 'file' ? 'revert' : 'whole';

export const describeChip = (chip: MessageChip) => {
  switch (chip.kind) {
    case 'file':
    case 'upload':
      return 'file';
    case 'command':
      return 'command';
    case 'paste':
      return 'pasted text';
  }
};

/** A chip with a tooltip, for a pointer: the prompt shows no chip's text on hover. */
function TooltipChip({tooltip, children}: {tooltip: ReactNode; children: ReactNode}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={<Chip.Root variant="soft" density="compact" />}>
        {children}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner>
          <Tooltip.Popup className={styles.lines}>{tooltip}</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

// Outside a component: a new function on every render would draw every chip again.
export const renderChip = (chip: MessageChip) => {
  switch (chip.kind) {
    case 'file':
      return (
        <TooltipChip tooltip={chip.path}>
          <Chip.Icon>
            <DescriptionIcon />
          </Chip.Icon>
          <Chip.Label>{chip.label}</Chip.Label>
        </TooltipChip>
      );
    case 'command':
      return (
        <TooltipChip tooltip={chip.description}>
          <Chip.Icon>
            <TerminalIcon />
          </Chip.Icon>
          <Chip.Label>{`/${chip.label}`}</Chip.Label>
        </TooltipChip>
      );
    case 'upload':
      return <UploadChip chip={chip} />;
    case 'paste':
      return (
        <TooltipChip tooltip={chip.text.split('\n').slice(0, 3).join('\n')}>
          <Chip.Icon>
            <ContentPasteIcon />
          </Chip.Icon>
          <Chip.Label>Pasted</Chip.Label>
          <Chip.Separator />
          <Chip.Label>{chip.label}</Chip.Label>
        </TooltipChip>
      );
  }
};
