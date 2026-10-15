import {LinkedHeading, Prose, Text} from '@earendil-works/elanor-react';

export default function LinkedHeadingProse() {
  return (
    <Prose>
      <Text>Invoices go to the billing contact on the first day of each month.</Text>
      <LinkedHeading
        level={3}
        size={3}
        id="payment-methods"
        linkLabel="Copy link to Payment methods"
      >
        Payment methods
      </LinkedHeading>
      <Text>Add a card or pay by bank transfer. Cards are charged when the invoice is issued.</Text>
    </Prose>
  );
}
