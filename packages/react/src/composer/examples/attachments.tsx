import {DescriptionIcon} from '@earendil-works/elanor-icons-react';
import {Chip, Composer, Stack, type ComposerValue} from '@earendil-works/elanor-react';
import {useRef, useState} from 'react';

const toText = (value: ComposerValue) => Composer.toText(value, (chip) => chip.label);

type Attachment = {id: number; file: File};

export default function ComposerAttachments() {
  const [files, setFiles] = useState<Attachment[]>([
    {id: 0, file: new File([''], 'checkout-error.png', {type: 'image/png'})},
  ]);
  const added = useRef(0);

  return (
    <Composer.Root
      toText={toText}
      onAttach={(picked) => {
        const attached = picked.map((file) => ({id: (added.current += 1), file}));
        setFiles((current) => [...current, ...attached]);
      }}
    >
      <Composer.Panel>
        <Composer.Field>
          <Composer.Attachments aria-label="Attached files">
            {files.map(({id, file}) => (
              <Chip.Root key={id} render={<li />}>
                <Chip.Icon>
                  <DescriptionIcon />
                </Chip.Icon>
                <Chip.Label>{file.name}</Chip.Label>
                <Chip.Remove
                  aria-label={`Remove ${file.name}`}
                  onClick={() => setFiles((current) => current.filter((item) => item.id !== id))}
                />
              </Chip.Root>
            ))}
          </Composer.Attachments>
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
