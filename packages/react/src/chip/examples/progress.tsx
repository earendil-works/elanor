import {UploadIcon} from '@earendil-works/elanor-icons-react';
import {Button, Chip, Stack} from '@earendil-works/elanor-react';
import {useEffect, useState} from 'react';

export default function ChipProgressExample() {
  const [progress, setProgress] = useState(0);

  // Demo only: simulates an upload; set the value from your upload's progress events instead.
  useEffect(() => {
    if (progress >= 100) return;
    const timer = setTimeout(() => setProgress((current) => Math.min(100, current + 20)), 600);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <Stack direction="row" align="center" gap="small" wrap="wrap">
      <Chip.Root variant="soft" density="compact">
        <Chip.Icon>
          <UploadIcon />
        </Chip.Icon>
        <Chip.Label>Upload</Chip.Label>
        <Chip.Separator />
        <Chip.Label>crash.log</Chip.Label>
        {progress < 100 ? (
          <Chip.Progress value={progress} aria-label="Uploading crash.log" />
        ) : null}
      </Chip.Root>
      <Chip.Root variant="soft" density="compact">
        <Chip.Icon>
          <UploadIcon />
        </Chip.Icon>
        <Chip.Label>Upload</Chip.Label>
        <Chip.Separator />
        <Chip.Label>screen.png</Chip.Label>
        <Chip.Progress value={null} aria-label="Uploading screen.png" />
      </Chip.Root>
      <Button hierarchy="tertiary" onClick={() => setProgress(0)}>
        Upload again
      </Button>
    </Stack>
  );
}
