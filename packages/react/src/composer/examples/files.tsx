import {DnsIcon, UploadIcon} from '@earendil-works/elanor-icons-react';
import {Chip, Composer, Stack, type ComposerValue} from '@earendil-works/elanor-react';

type FileChip = {id: string; label: string; place: string; path: string; uploadId?: string};

const draft: ComposerValue<FileChip> = [
  'Compare ',
  {id: 'before', label: 'before.png', place: 'Upload', path: 'before.png'},
  ' with ',
  {id: 'design', label: 'design.png', place: 'devbox', path: 'docs/design.png'},
  ' and tell me what moved',
];

const toText = (value: ComposerValue<FileChip>) =>
  Composer.toText(value, (chip) =>
    chip.place === 'Upload' ? `@uploads:${chip.path}` : `@${chip.place}:${chip.path}`,
  );

let uploads = 0;

const renderChip = (chip: FileChip) => (
  <Chip.Root variant="soft" density="compact">
    <Chip.Icon>{chip.place === 'Upload' ? <UploadIcon /> : <DnsIcon />}</Chip.Icon>
    <Chip.Label>{chip.place}</Chip.Label>
    <Chip.Separator />
    <Chip.Label>{chip.label}</Chip.Label>
  </Chip.Root>
);

export default function ComposerFiles() {
  return (
    <Composer.Root
      defaultValue={draft}
      toText={toText}
      onAttach={(files, details) => {
        // Demo only: this uploads nothing; start each upload here and keep its state by uploadId.
        const chips = files.map((file) => ({
          id: `file-${(uploads += 1)}`,
          uploadId: `upload-${uploads}`,
          label: file.name,
          place: 'Upload',
          path: file.name,
        }));
        details.insert(chips);
      }}
      getChipDescription={() => 'file'}
      renderChip={renderChip}
    >
      <Composer.Panel>
        <Composer.Field>
          <Composer.Prompt
            aria-label="Message"
            placeholder="Paste or drop a screenshot, or attach a PDF…"
          />
          <Composer.Controls render={<Stack direction="row" gap="auto" align="center" />}>
            <Composer.Attach aria-label="Attach files" accept="image/*,.pdf" />
            <Composer.Submit />
          </Composer.Controls>
        </Composer.Field>
      </Composer.Panel>
    </Composer.Root>
  );
}
