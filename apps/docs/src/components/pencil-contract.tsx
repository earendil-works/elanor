import {AppearanceProvider, Button, Input, Popover, Stack} from '@earendil-works/elanor-react';
import {PencilAppearance, PencilStrokeOutline} from '@earendil-works/elanor-strokes-react';
import {useState} from 'react';

function PopupExample({name, container}: {name: string; container?: HTMLElement | null}): React.JSX.Element {
  return (
    <Popover.Root>
      <Popover.Trigger render={<Button />}>Open {name}</Popover.Trigger>
      <Popover.Portal container={container}>
        <Popover.Positioner>
          <Popover.Popup id={`${name}-popup`} bodyProps={{id: `${name}-body`}}>
            <Popover.Title>{name}</Popover.Title>
            <Input aria-label={`${name} field`} />
            <Popover.Close render={<Button />}>Close {name}</Popover.Close>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** Executable appearance contracts, separate from frozen design fixtures. */
export function PencilContract(): React.JSX.Element {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [changes, setChanges] = useState(0);
  return (
    <Stack gap="large">
      <h1>Pencil appearance contracts</h1>
      <p>Components own ordinary rendering; the consumer provider selects optional surface and indicator skins.</p>
      <PencilAppearance>
        <Button id="pencil-button" className={state => state.disabled ? 'disabled-test' : 'enabled-test'}>Pencil</Button>
        <Button id="element-render" render={<a href="#target">Custom element children</a>} nativeButton={false} />
        <Button id="callback-render" render={props => <button {...props}>Callback children</button>} />
        <Button id="unsupported-shape" data-outline="future-shape">Unsupported shape stays plain</Button>
        <PopupExample name="pencil" />
        <AppearanceProvider>
          <Button id="plain-button">Nested plain</Button>
          <PopupExample name="plain" />
          <PencilAppearance><Button id="pencil-again">Pencil again</Button></PencilAppearance>
        </AppearanceProvider>
        <Input
          id="custom-input"
          aria-label="Custom input"
          onValueChange={() => setChanges(count => count + 1)}
          ref={node => {node?.setAttribute('data-input-ref', 'yes');}}
          className="custom-control"
          frameProps={{
            id: 'custom-frame', className: 'custom-frame', style: {inlineSize: '12rem'},
            ref: node => {node?.setAttribute('data-frame-ref', 'yes');},
          }}
        />
        <output aria-label="Change count">{changes}</output>
        <PopupExample name="custom-container" container={container} />
      </PencilAppearance>
      <div id="portal-host" ref={setContainer} />
      <PencilStrokeOutline id="wrapper" radius="medium" variant={2}>
        <h2>A consumer-owned surface</h2>
        <Button id="wrapper-plain-child">Plain child keeps focus</Button>
      </PencilStrokeOutline>
      <AppearanceProvider surfaceClassName="consumer-skin">
        <Button id="consumer-button">Another consumer skin</Button>
      </AppearanceProvider>
    </Stack>
  );
}
