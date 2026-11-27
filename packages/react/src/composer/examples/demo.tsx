import {MicIcon, PhotoCameraIcon} from '@earendil-works/elanor-icons-react';
import {
  Composer,
  IconButton,
  Stack,
  Text,
  type ComposerActions,
} from '@earendil-works/elanor-react';
import {useRef, useState, type ReactNode} from 'react';

import {
  chipDeletion,
  chipText,
  describeChip,
  getPastedValue,
  renderChip,
  toText,
  type Message,
  type MessageChip,
} from './hero/chips.tsx';
import {DropZone} from './hero/drop-zone.tsx';
import {Figures, ModelPicker} from './hero/footer.tsx';
import {FileAndCommandSuggestions} from './hero/suggestions.tsx';
import {
  pending,
  SendButton,
  startUpload,
  syncUploads,
  UploadErrors,
  uploadIdsOf,
  uploadUrl,
} from './hero/uploads.tsx';

import styles from './composer.module.css';

// Demo only: earlier messages; load the conversation's sent messages from your store.
const earlier: Message[] = [
  ['Why does the docs build fail on Node 24?'],
  [
    'Compare ',
    {kind: 'file', id: 'file-build', label: 'build.mjs', path: 'scripts/build.mjs'},
    ' with the version on main.',
  ],
  ['Write the release notes for 0.4, grouped by component.'],
];

/** The message as your server takes it: each upload by its address, read when it's sent. */
const messageText = (message: Message) =>
  Composer.valueToText(message, (chip) =>
    chip.kind === 'upload' ? `@${uploadUrl(chip.uploadId) ?? chip.label}` : chipText(chip),
  );

const MAX_BYTES = 20 * 1024 * 1024;

// `accept` limits only the picker: dropped and pasted files come whatever their type.
const attachable = (file: File) =>
  (file.type.startsWith('image/') || file.type === 'application/pdf') && file.size <= MAX_BYTES;

interface MessageComposerProps {
  readonly onSend: (message: Message) => void;
  readonly onNotice: (notice: string) => void;
  readonly children: ReactNode;
}

/** Owns the draft. Typing renders this and the prompt, not `children`. */
function MessageComposer({onSend, onNotice, children}: MessageComposerProps) {
  const [value, setValue] = useState<Message>([]);
  const actions = useRef<ComposerActions<MessageChip>>(null);

  return (
    <Composer.Root
      value={value}
      onValueChange={(next) => {
        setValue(next);
        syncUploads(uploadIdsOf(next));
      }}
      actionsRef={actions}
      toText={toText}
      renderChip={renderChip}
      chipDeletion={chipDeletion}
      getChipDescription={describeChip}
      getPastedValue={getPastedValue}
      onAttach={(files, details) => {
        const accepted = files.filter(attachable);
        onNotice(
          accepted.length < files.length ? 'Only images and PDFs up to 20 MB can be attached.' : '',
        );
        const added = accepted.map((file) => {
          const chip = {
            kind: 'upload',
            id: crypto.randomUUID(),
            label: file.name,
            uploadId: crypto.randomUUID(),
          } as const;
          return {file, chip};
        });
        // Only files that went into the text start uploading.
        if (!details.insert(added.map(({chip}) => chip))) return;
        for (const {file, chip} of added) startUpload(chip.uploadId, file);
      }}
      // Enter sends without Submit, so check here too.
      onSubmit={(message) => {
        if (pending(uploadIdsOf(message)) || !toText(message).trim()) return;
        onSend(message);
        actions.current?.clearHistory();
        setValue([]);
      }}
    >
      {children}
    </Composer.Root>
  );
}

/** Inside Root, where `useRecall` finds the prompt. */
function MessagePrompt({messages}: {messages: readonly Message[]}) {
  const recall = Composer.useRecall(messages);
  return <Composer.Prompt aria-label="Message" placeholder="Message Pi…" onKeyDown={recall} />;
}

const secret = /\b(?:sk-|ghp_|xox[bp]-)[A-Za-z0-9]{16,}/;
const hasSecret = (value: Message) => secret.test(toText(value));

function SecretNotice() {
  // A boolean: renders again only when the answer changes, not on every key.
  const found = Composer.useValue(hasSecret);
  return found ? <Text role="alert">This looks like a key or a password.</Text> : null;
}

function DictateButton() {
  const {insert, focus} = Composer.useActions<MessageChip>();
  return (
    <IconButton
      density="default"
      aria-label="Dictate"
      onClick={() => {
        // Demo only: a fixed sentence; insert the text your speech recognition hears.
        insert('Summarize the open pull requests.', {space: true});
        focus({at: 'caret'});
      }}
    >
      <MicIcon />
    </IconButton>
  );
}

interface SendOrStopProps {
  readonly replying: boolean;
  readonly onStop: () => void;
}

/** Stop while a reply runs and nothing new is written, so a press meant for Stop never sends. */
function SendOrStop({replying, onStop}: SendOrStopProps) {
  const {empty} = Composer.useStatus();
  return replying && empty ? (
    <Composer.Stop key="stop" onClick={onStop} />
  ) : (
    <SendButton key="send" />
  );
}

// Demo only: a reply that takes longer for a longer message. Send the text to your server, and
// cancel the request in Stop's `onClick`.
const replyTo = (text: string, done: () => void) => setTimeout(done, 2000 + text.length * 20);

export default function ComposerDemo() {
  const [messages, setMessages] = useState(earlier);
  const [notice, setNotice] = useState('');
  const [replying, setReplying] = useState(false);
  const reply = useRef<ReturnType<typeof setTimeout>>(undefined);

  const send = (message: Message) => {
    setMessages((current) => [...current, message]);
    setNotice('');
    clearTimeout(reply.current);
    setReplying(true);
    reply.current = replyTo(messageText(message), () => setReplying(false));
  };

  const stop = () => {
    clearTimeout(reply.current);
    setReplying(false);
  };

  return (
    <MessageComposer onSend={send} onNotice={setNotice}>
      <DropZone>
        <Composer.Panel className={styles.textAligned}>
          <Composer.Header>
            <SecretNotice />
            <UploadErrors />
            {notice ? <Text role="alert">{notice}</Text> : null}
          </Composer.Header>
          <Composer.InputGroup>
            <MessagePrompt messages={messages} />
            <Composer.Controls render={<Stack direction="row" gap="auto" align="center" />}>
              <Stack direction="row" gap="xSmall" align="center">
                <Composer.Attach accept="image/*,.pdf" />
                <Composer.Attach
                  aria-label="Take a photo"
                  accept="image/*"
                  capture="environment"
                  className={styles.camera}
                >
                  <PhotoCameraIcon />
                </Composer.Attach>
              </Stack>
              <Stack direction="row" gap="xSmall" align="center">
                <DictateButton />
                <SendOrStop replying={replying} onStop={stop} />
              </Stack>
            </Composer.Controls>
          </Composer.InputGroup>
          <Composer.Footer>
            <ModelPicker />
            <Figures />
          </Composer.Footer>
        </Composer.Panel>
      </DropZone>
      <FileAndCommandSuggestions />
    </MessageComposer>
  );
}
