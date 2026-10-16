import {Heading, Skeleton, SkeletonText, Stack, Text} from '@earendil-works/elanor-react';

export default function SkeletonDemo() {
  return (
    <Stack gap="small" align="stretch" aria-busy>
      <Heading level={2} size={4}>
        <Skeleton>Workspace settings</Skeleton>
      </Heading>
      <Text>
        <SkeletonText lines={3} />
      </Text>
    </Stack>
  );
}
