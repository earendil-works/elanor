import {
  ContentPasteIcon,
  DescriptionIcon,
  TerminalIcon,
  UploadIcon,
} from '@earendil-works/elanor-icons-react';
import {Chip, Composer, Tooltip, type ComposerValue} from '@earendil-works/elanor-react';
import type {ReactNode} from 'react';

import {useUpload} from './uploads.tsx';

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
export const toText = (value: Message) => Composer.valueToText(value, chipText);

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

// What the tooltips show, for screen readers too: the tooltips open for a pointer only.
export const describeChip = (chip: MessageChip) => {
  switch (chip.kind) {
    case 'file':
      return `file, ${chip.path}`;
    case 'command':
      return `command, ${chip.description}`;
    case 'upload':
      return 'file';
    case 'paste':
      return 'pasted text';
  }
};

interface TooltipChipProps {
  readonly tooltip: ReactNode;
  readonly semantic?: 'neutral' | 'negative';
  readonly children: ReactNode;
}

/** A chip with a tooltip, for a pointer: the prompt shows no chip's text on hover. */
function TooltipChip({tooltip, semantic = 'neutral', children}: TooltipChipProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger render={<Chip.Root variant="soft" density="compact" semantic={semantic} />}>
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

/** Renders again only when its own upload changes, such as a progress tick. */
function UploadChip({chip}: {chip: Extract<MessageChip, {kind: 'upload'}>}) {
  const upload = useUpload(chip.uploadId);
  const content = (
    <>
      <Chip.Icon>
        <UploadIcon />
      </Chip.Icon>
      <Chip.Label>Upload</Chip.Label>
      <Chip.Separator />
      <Chip.Label>{chip.label}</Chip.Label>
      {upload?.state === 'uploading' ? (
        <Chip.Progress value={upload.progress} aria-label={`Uploading ${chip.label}`} />
      ) : null}
      {upload?.state === 'failed' ? (
        // Here, not in `getChipDescription`: Root reads that only when it draws the chip, and a
        // failure doesn't draw it again.
        <span className={styles.visuallyHidden}>{`, ${upload.error}`}</span>
      ) : null}
    </>
  );
  return upload?.state === 'failed' ? (
    <TooltipChip tooltip={upload.error} semantic="negative">
      {content}
    </TooltipChip>
  ) : (
    <Chip.Root variant="soft" density="compact">
      {content}
    </Chip.Root>
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
