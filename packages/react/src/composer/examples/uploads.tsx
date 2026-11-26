import {UploadIcon} from '@earendil-works/elanor-icons-react';
import {
  Chip,
  Composer,
  Stack,
  Text,
  type ComposerActions,
  type ComposerValue,
} from '@earendil-works/elanor-react';
import {useRef, useState, useSyncExternalStore} from 'react';

type FileChip = {id: string; label: string; uploadId: string};

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
function startUpload(uploadId: string, file: File) {
  let progress = 0;
  setUpload(uploadId, {progress, url: undefined});
  const timer = setInterval(() => {
    progress += 10;
    const done = progress >= 100;
    setUpload(uploadId, {progress, url: done ? `uploads/${file.name}` : undefined});
    if (done) clearInterval(timer);
  }, 300);
}

// Demo only: a counter; use the ids your upload service gives.
let uploadCount = 0;

// Root calls `toText` on an edit, so it reads nothing that changes without one.
const toText = (value: ComposerValue<FileChip>) =>
  Composer.toText(value, (chip) => `@uploads:${chip.label}`);

// What is sent: each file's address, read when sending.
const messageOf = (value: ComposerValue<FileChip>) =>
  Composer.toText(value, (chip) => `@${uploads.get(chip.uploadId)?.url ?? chip.label}`);

const uploadIdsOf = (value: ComposerValue<FileChip>): string[] =>
  value.filter(Composer.isChip).map((chip) => chip.uploadId);

const sameIds = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((id, index) => id === b[index]);

const pending = (uploadIds: readonly string[]) => uploadIds.some((id) => !uploads.get(id)?.url);

function UploadChip({chip}: {chip: FileChip}) {
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

// Outside the component: a new function on every render would draw every chip again.
const renderChip = (chip: FileChip) => <UploadChip chip={chip} />;

/** Disabled while a file in the text is uploading. */
function SendButton() {
  // Compared by `sameIds`, so typing doesn't render the button again.
  const uploadIds = Composer.useValue(uploadIdsOf, sameIds);
  const waiting = useSyncExternalStore(
    subscribe,
    () => pending(uploadIds),
    () => false,
  );
  return <Composer.Submit disabled={waiting} />;
}

export default function ComposerUploads() {
  const [value, setValue] = useState<ComposerValue<FileChip>>([]);
  const [sent, setSent] = useState('');
  const actions = useRef<ComposerActions<FileChip>>(null);

  return (
    <Stack gap="small" align="stretch">
      <Composer.Root
        value={value}
        onValueChange={setValue}
        toText={toText}
        actionsRef={actions}
        renderChip={renderChip}
        getChipDescription={() => 'file'}
        onAttach={(files, details) => {
          const added = files.map((file) => {
            uploadCount += 1;
            const chip = {
              id: `file-${uploadCount}`,
              label: file.name,
              uploadId: `upload-${uploadCount}`,
            };
            return {file, chip};
          });
          // Only files that went into the text start uploading.
          if (!details.insert(added.flatMap(({chip}) => [chip, ' ']))) return;
          for (const {file, chip} of added) startUpload(chip.uploadId, file);
        }}
        // Enter sends without Submit, so check here too.
        onSubmit={(message) => {
          if (pending(uploadIdsOf(message)) || !toText(message).trim()) return;
          setSent(`Sent: ${messageOf(message)}`);
          actions.current?.clearHistory();
          setValue([]);
        }}
      >
        <Composer.Panel>
          <Composer.Field>
            <Composer.Prompt aria-label="Message" placeholder="Drop or paste a screenshot…" />
            <Composer.Controls render={<Stack direction="row" gap="auto" align="center" />}>
              <Composer.Attach aria-label="Attach files" accept="image/*,.pdf" />
              <SendButton />
            </Composer.Controls>
          </Composer.Field>
        </Composer.Panel>
      </Composer.Root>
      <Text role="status">{sent}</Text>
    </Stack>
  );
}
