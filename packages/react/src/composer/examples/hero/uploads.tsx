import {Composer, Text} from '@earendil-works/elanor-react';
import {memo, useSyncExternalStore} from 'react';

import type {Message} from './chips.tsx';

type Upload =
  | {readonly state: 'uploading'; readonly progress: number}
  | {readonly state: 'done'; readonly url: string}
  | {readonly state: 'failed'; readonly error: string};

// Demo only: a module-level store; keep your uploads in your app's store.
const uploads = new Map<string, Upload>();
const files = new Map<string, File>();
const requests = new Map<string, ReturnType<typeof setInterval>>();
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const notify = () => {
  for (const listener of listeners) listener();
};
const setUpload = (uploadId: string, upload: Upload) => {
  uploads.set(uploadId, upload);
  notify();
};

const finish = (uploadId: string, upload: Upload) => {
  clearInterval(requests.get(uploadId));
  requests.delete(uploadId);
  setUpload(uploadId, upload);
};

// Demo only: a timer stands in for your upload request, and a file whose name starts with "fail"
// fails halfway, as a request can.
export function startUpload(uploadId: string, file: File) {
  files.set(uploadId, file);
  let progress = 0;
  setUpload(uploadId, {state: 'uploading', progress});
  const request = setInterval(() => {
    progress += 10;
    if (progress === 50 && file.name.startsWith('fail')) {
      finish(uploadId, {
        state: 'failed',
        error: `${file.name} didn't upload: the connection was lost.`,
      });
    } else if (progress < 100) {
      setUpload(uploadId, {state: 'uploading', progress});
    } else {
      finish(uploadId, {state: 'done', url: `uploads/${file.name}`});
    }
  }, 300);
  requests.set(uploadId, request);
}

/**
 * Cancels the uploads whose chip left the text, and starts again those Undo brought back. Call it
 * with the upload ids of every new value.
 */
export function syncUploads(uploadIds: readonly string[]) {
  for (const uploadId of requests.keys()) {
    if (uploadIds.includes(uploadId)) continue;
    clearInterval(requests.get(uploadId));
    requests.delete(uploadId);
    uploads.delete(uploadId);
    notify();
  }
  for (const uploadId of uploadIds) {
    const file = files.get(uploadId);
    if (file && !uploads.has(uploadId)) startUpload(uploadId, file);
  }
}

/** Renders again only when this upload changes. */
export const useUpload = (uploadId: string) =>
  useSyncExternalStore(
    subscribe,
    () => uploads.get(uploadId),
    () => undefined,
  );

/** The file's address once it's uploaded. */
export const uploadUrl = (uploadId: string) => {
  const upload = uploads.get(uploadId);
  return upload?.state === 'done' ? upload.url : undefined;
};

const uploadError = (uploadId: string) => {
  const upload = uploads.get(uploadId);
  return upload?.state === 'failed' ? upload.error : undefined;
};

export const uploadIdsOf = (value: Message): string[] =>
  value.flatMap((segment) =>
    Composer.isChip(segment) && segment.kind === 'upload' ? [segment.uploadId] : [],
  );

const sameIds = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((id, index) => id === b[index]);

export const pending = (uploadIds: readonly string[]) =>
  uploadIds.some((id) => uploadUrl(id) === undefined);

const errorsOf = (uploadIds: readonly string[]) =>
  uploadIds.flatMap((id) => uploadError(id) ?? []).join(' ');

/**
 * Disabled until every file in the text is uploaded. Memoized: its parent renders again when the
 * prompt empties or fills, and the button needn't.
 */
export const SendButton = memo(function SendButton() {
  // Compared by `sameIds`, so typing doesn't render the button again.
  const uploadIds = Composer.useValue(uploadIdsOf, sameIds);
  const waiting = useSyncExternalStore(
    subscribe,
    () => pending(uploadIds),
    () => false,
  );
  return <Composer.Submit disabled={waiting} />;
});

/** Says why uploads in the text failed, also on a touch screen, where tooltips don't open. */
export function UploadErrors() {
  const uploadIds = Composer.useValue(uploadIdsOf, sameIds);
  const errors = useSyncExternalStore(
    subscribe,
    () => errorsOf(uploadIds),
    () => '',
  );
  return errors ? <Text role="alert">{errors}</Text> : null;
}
