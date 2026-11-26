import {UploadIcon} from '@earendil-works/elanor-icons-react';
import {Chip, type ChipSemantic, Stack} from '@earendil-works/elanor-react';

const uploads: ReadonlyArray<{name: string; semantic: ChipSemantic}> = [
  {name: 'screen.png', semantic: 'neutral'},
  {name: 'release-notes.md', semantic: 'positive'},
  {name: 'recording.mov', semantic: 'warning'},
  {name: 'crash.log', semantic: 'negative'},
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
    </Stack>
  );
}
