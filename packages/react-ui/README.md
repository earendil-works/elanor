# `@earendil-works/elanor-react-ui`

Elanor components for React, built with Base UI 1.8 and co-located CSS Modules. Products provide the inherited semantic token values.

## Install

```sh
pnpm add @earendil-works/elanor-react-ui react react-dom
```

React and React DOM are peer dependencies. Base UI is included as an internal dependency.

## Fields

```tsx
import {Button, Field, Stack, TextArea, TextField} from '@earendil-works/elanor-react-ui';

<form>
  <Stack gap="lg">
    <Field.Root name="project">
      <Field.Label>Project name</Field.Label>
      <TextField required minLength={3} />
      <Field.Description>Shown to everyone in the workspace.</Field.Description>
      <Field.Error />
    </Field.Root>

    <Field.Root name="notes">
      <Field.Label>Notes</Field.Label>
      <TextArea rows={5} />
      <Field.Error />
    </Field.Root>

    <Button type="submit" variant="primary">Save changes</Button>
  </Stack>
</form>
```

`TextField` and `TextArea` support Base UI field validation and `onValueChange(value, details)`.

## Choice lists

```tsx
import {Choice, ChoiceList, Field, Fieldset} from '@earendil-works/elanor-react-ui';

<Field.Root name="visibility">
  <Fieldset.Root render={<ChoiceList.Root defaultValue="private" required />}>
    <Fieldset.Legend>Visibility</Fieldset.Legend>
    <ChoiceList.Options>
      <Choice.Item>
        <Choice.Label>
          <Choice.Root value="private"><Choice.Indicator /></Choice.Root>
          Private
        </Choice.Label>
      </Choice.Item>
      <Choice.Item>
        <Choice.Label>
          <Choice.Root value="public"><Choice.Indicator /></Choice.Root>
          Public
        </Choice.Label>
      </Choice.Item>
    </ChoiceList.Options>
  </Fieldset.Root>
  <Field.Error />
</Field.Root>
```

Choice values are strings. `ChoiceList.Root` accepts string literal unions for narrower typing.

## Dialogs

```tsx
import {Button, Dialog, Paragraph} from '@earendil-works/elanor-react-ui';

<Dialog.Root>
  <Dialog.Trigger render={<Button />}>Open details</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Viewport>
      <Dialog.Popup>
        <Dialog.Title>Details</Dialog.Title>
        <Dialog.Description>Review before continuing.</Dialog.Description>
        <Dialog.Body><Paragraph>Dialog content.</Paragraph></Dialog.Body>
        <Dialog.Actions>
          <Dialog.Close render={<Button />}>Close</Dialog.Close>
        </Dialog.Actions>
      </Dialog.Popup>
    </Dialog.Viewport>
  </Dialog.Portal>
</Dialog.Root>
```

For non-modal dialogs, omit `Dialog.Backdrop`. When tokens are scoped below the document root, pass the themed element to `Dialog.Portal` through `container`.

## Other primitives

- `Text` renders `<span>`.
- `Paragraph` renders `<p>`.
- `Code` renders `<code>`.
- `Heading` separates semantic `level` from visual `size`.
- `Stack`, `Box`, and `Badge` provide token-based layout and presentation.
