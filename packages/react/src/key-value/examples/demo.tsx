import {KeyValue} from '@earendil-works/elanor-react';

export default function KeyValueDemo() {
  return (
    <KeyValue.Grid>
      <KeyValue.Key>Status</KeyValue.Key>
      <KeyValue.Value>Active</KeyValue.Value>
      <KeyValue.Key>Owner</KeyValue.Key>
      <KeyValue.Value>Alex Morgan</KeyValue.Value>
      <KeyValue.Key>Created</KeyValue.Key>
      <KeyValue.Value>
        <time dateTime="2026-09-21">21 September 2026</time>
      </KeyValue.Value>
    </KeyValue.Grid>
  );
}
