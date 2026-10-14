import {Button, Field, Form, Grid, Input, Stack, Text} from '@earendil-works/elanor-react';
import {useState} from 'react';

export default function FormDemo() {
  const [message, setMessage] = useState('');

  return (
    <Grid.Root>
      <Grid.Item span={{base: 'full', xSmall: 6, medium: 4}}>
        <Form onFormSubmit={(values) => setMessage(`Invite sent to ${values.email}.`)}>
          <Stack gap="medium" align="stretch">
            <Field.Root name="name">
              <Field.Label>Name</Field.Label>
              <Input autoComplete="name" required />
              <Field.Error match="valueMissing">Enter a name.</Field.Error>
            </Field.Root>
            <Field.Root name="email">
              <Field.Label>Email</Field.Label>
              <Input type="email" autoComplete="email" required />
              <Field.Error match="valueMissing">Enter an email address.</Field.Error>
              <Field.Error match="typeMismatch">Enter a valid email address.</Field.Error>
            </Field.Root>
            <Stack direction="row">
              <Button type="submit">Send invite</Button>
            </Stack>
            <Text role="status">{message}</Text>
          </Stack>
        </Form>
      </Grid.Item>
    </Grid.Root>
  );
}
