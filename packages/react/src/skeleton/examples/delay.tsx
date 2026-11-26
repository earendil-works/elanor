import {Button, Skeleton, Stack, Text} from '@earendil-works/elanor-react';
import {useState} from 'react';

import styles from './delay.module.css';

export default function SkeletonDelay() {
  const [loading, setLoading] = useState(false);
  const [owner, setOwner] = useState('Ada Lovelace');

  function load(name: string, latency: number) {
    setLoading(true);
    // Demo only: set `loading` from your data instead.
    setTimeout(() => {
      setOwner(name);
      setLoading(false);
    }, latency);
  }

  return (
    <Stack gap="medium" className={styles.timing}>
      <Text aria-busy={loading} aria-live="polite">
        Owner: <Skeleton loading={loading}>{owner}</Skeleton>
      </Text>
      <Stack direction="row" gap="small">
        <Button hierarchy="secondary" disabled={loading} onClick={() => load('Grace Hopper', 100)}>
          Fast answer
        </Button>
        <Button
          hierarchy="secondary"
          disabled={loading}
          onClick={() => load('Katherine Johnson', 1500)}
        >
          Slow answer
        </Button>
      </Stack>
    </Stack>
  );
}
