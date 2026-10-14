import {
  Button,
  Field,
  Form,
  Grid,
  Input,
  Stack,
  type FormProps,
} from '@earendil-works/elanor-react';
import {useState} from 'react';

export default function FormServerErrors() {
  const [errors, setErrors] = useState<FormProps['errors']>({});

  return (
    <Grid.Root>
      <Grid.Item span={{base: 'full', xSmall: 6, medium: 4}}>
        <Form
          errors={errors}
          onFormSubmit={(values) => {
            // Stands in for a server response.
            setErrors(
              values.email === 'alex@example.com'
                ? {email: 'This email already has an account.'}
                : {},
            );
          }}
        >
          <Stack gap="medium" align="stretch">
            <Field.Root name="email">
              <Field.Label>Email</Field.Label>
              <Input type="email" autoComplete="email" defaultValue="alex@example.com" required />
              <Field.Error />
            </Field.Root>
            <Stack direction="row">
              <Button type="submit">Create account</Button>
            </Stack>
          </Stack>
        </Form>
      </Grid.Item>
    </Grid.Root>
  );
}
