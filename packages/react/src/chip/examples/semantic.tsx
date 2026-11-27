import {UploadIcon} from '@earendil-works/elanor-icons-react';
import {Chip, type ChipSemantic, Stack, Text} from '@earendil-works/elanor-react';

const uploads: ReadonlyArray<{name: string; semantic: ChipSemantic; state: string}> = [
  {name: 'screen.png', semantic: 'neutral', state: 'is uploaded'},
  {name: 'release-notes.md', semantic: 'positive', state: 'passed its checks'},
  {name: 'recording.mov', semantic: 'warning', state: 'is too long to preview'},
  {name: 'crash.log', semantic: 'negative', state: "didn't upload: connection lost"},
];

export default function ChipSemanticExample() {
  return (
    <Stack gap="small">
      <Stack direction="row" align="center" gap="xSmall" wrap="wrap">
        {uploads.map(({name, semantic}) => (
          <Chip.Root key={name} variant="soft" semantic={semantic}>
            <Chip.Icon>
              <UploadIcon />
            </Chip.Icon>
            <Chip.Label>{name}</Chip.Label>
          </Chip.Root>
        ))}
      </Stack>
      <Stack direction="row" align="center" gap="xSmall" wrap="wrap">
        {uploads.map(({name, semantic}) => (
          <Chip.Root key={name} semantic={semantic}>
            <Chip.Icon>
              <UploadIcon />
            </Chip.Icon>
            <Chip.Label>{name}</Chip.Label>
          </Chip.Root>
        ))}
      </Stack>
      {/* The color doesn't say why: the state in words, beside the chips. */}
      <Text>{uploads.map(({name, state}) => `${name} ${state}.`).join(' ')}</Text>
    </Stack>
  );
}
