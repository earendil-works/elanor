import {Button, Card, Skeleton, Stack} from '@earendil-works/elanor-react';
import {useState} from 'react';

export default function SkeletonLoading() {
  const [loading, setLoading] = useState(false);

  return (
    <Stack gap="medium">
      <Skeleton loading={loading} render={<div />}>
        <Card label="Active projects" value="12" description="Across three teams" />
      </Skeleton>
      <Button
        hierarchy="secondary"
        pending={loading}
        onClick={() => {
          setLoading(true);
          setTimeout(() => setLoading(false), 2000);
        }}
      >
        Refresh
      </Button>
    </Stack>
  );
}
