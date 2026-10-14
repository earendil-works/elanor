import {Button} from '@earendil-works/elanor-react';
import {useState} from 'react';

export default function ButtonPending() {
  const [pending, setPending] = useState(false);

  return (
    <Button
      pending={pending}
      onClick={() => {
        setPending(true);
        setTimeout(() => setPending(false), 2000);
      }}
    >
      {pending ? 'Saving…' : 'Save changes'}
    </Button>
  );
}
