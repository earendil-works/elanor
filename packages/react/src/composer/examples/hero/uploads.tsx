import {UploadIcon} from '@earendil-works/elanor-icons-react';
import {Chip, Composer} from '@earendil-works/elanor-react';
import {useSyncExternalStore} from 'react';

import type {Message, MessageChip} from './chips.tsx';

type UploadChipValue = Extract<MessageChip, {kind: 'upload'}>;

type Upload = {readonly progress: number; readonly url: string | undefined};

// Demo only: a module-level store; keep your uploads in your app's store.
const uploads = new Map<string, Upload>();
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const setUpload = (uploadId: string, upload: Upload) => {
  uploads.set(uploadId, upload);
  for (const listener of listeners) listener();
};

// Demo only: a timer stands in for your upload request.
export function startUpload(uploadId: string, file: File) {
  let progress = 0;
  setUpload(uploadId, {progress, url: undefined});
  const timer = setInterval(() => {
    progress += 10;
    const done = progress >= 100;
    setUpload(uploadId, {progress, url: done ? `uploads/${file.name}` : undefined});
    if (done) clearInterval(timer);
  }, 300);
}

/** The file's address once it's uploaded. */
export const uploadUrl = (uploadId: string) => uploads.get(uploadId)?.url;

export const uploadIdsOf = (value: Message): string[] =>
  value.flatMap((segment) =>
    Composer.isChip(segment) && segment.kind === 'upload' ? [segment.uploadId] : [],
  );

const sameIds = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((id, index) => id === b[index]);

export const pending = (uploadIds: readonly string[]) =>
  uploadIds.some((id) => !uploads.get(id)?.url);

/** Renders again only when its own upload changes. */
export function UploadChip({chip}: {chip: UploadChipValue}) {
  const upload = useSyncExternalStore(
    subscribe,
    () => uploads.get(chip.uploadId),
    () => undefined,
  );
  return (
    <Chip.Root variant="soft" density="compact">
      <Chip.Icon>
        <UploadIcon />
      </Chip.Icon>
      <Chip.Label>Upload</Chip.Label>
      <Chip.Separator />
      <Chip.Label>{chip.label}</Chip.Label>
      {upload && !upload.url ? (
        <Chip.Progress value={upload.progress} aria-label={`Uploading ${chip.label}`} />
      ) : null}
    </Chip.Root>
  );
}

/** Disabled until every file in the text is uploaded. */
export function SendButton() {
  // Compared by `sameIds`, so typing doesn't render the button again.
  const uploadIds = Composer.useValue(uploadIdsOf, sameIds);
  const waiting = useSyncExternalStore(
    subscribe,
    () => pending(uploadIds),
    () => false,
  );
  return <Composer.Submit disabled={waiting} />;
}
