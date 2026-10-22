import {Message, Stack, type MessageParticipant} from '@earendil-works/elanor-react';

const PEOPLE = ['Anna', 'Ben', 'Chloé', 'Dev', 'Emil', 'Farah'];

export default function MessageParticipants() {
  return (
    <Stack gap="small">
      {PEOPLE.map((name, index) => (
        <Message.Root key={name} participant={(index + 1) as MessageParticipant}>
          <Message.Bubble>
            <Message.Speaker>{name}</Message.Speaker>
            <Message.Text>Participant {index + 1}</Message.Text>
          </Message.Bubble>
        </Message.Root>
      ))}
    </Stack>
  );
}
