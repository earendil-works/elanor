import {
  AppearanceProvider,
  Button,
  Checkbox,
  IconButton,
  NavigationItem,
  Radio,
  Search,
  Separator,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TextArea,
} from '@earendil-works/elanor-react';
import {PencilAppearance, PencilStrokeOutline, pencilSurfaceClassName} from '@earendil-works/elanor-strokes-react';
import {useState} from 'react';

interface ControlsProps {
  readonly name: string;
}

/** Identical content and dimensions in each provider; only IDs and the heading vary. */
function Controls({name}: ControlsProps): React.JSX.Element {
  const [events, setEvents] = useState({checkbox: 0, radio: 0, switch: 0, icon: 0, textarea: 0, search: 0, disabled: 0});
  const record = (event: keyof typeof events) => setEvents(previous => ({...previous, [event]: previous[event] + 1}));
  return (
    <section id={`${name}-group`} aria-label={`${name} controls`} style={{inlineSize: 'min(100%, 24rem)'}}>
      <h2>{name}</h2>
      <Stack gap="medium">
        <Button id={`${name}-button`}>Self focus</Button>
        <Stack direction="row" gap="small">
          <Checkbox.Root id={`${name}-check`} nativeButton render={<button />} defaultChecked onCheckedChange={() => record('checkbox')}>
            <Checkbox.Indicator
              id={`${name}-check-mark`}
              className="default-glyph-customization"
              style={{opacity: 0.75}}
              ref={node => {node?.setAttribute('data-glyph-ref', 'yes');}}
            />
          </Checkbox.Root>
          <label id={`${name}-check-label`} htmlFor={`${name}-check`}>Checked</label>
          <Checkbox.Root id={`${name}-mixed`} nativeButton render={<button />} aria-label="Indeterminate" indeterminate>
            <Checkbox.Indicator id={`${name}-mixed-mark`} />
          </Checkbox.Root>
          <Checkbox.Root id={`${name}-custom-check`} nativeButton render={<button />} aria-label="Custom checkbox" defaultChecked>
            <Checkbox.Indicator id={`${name}-custom-check-mark`}><span data-custom-mark="">C</span></Checkbox.Indicator>
          </Checkbox.Root>
        </Stack>
        <Stack direction="row" gap="small">
          <Checkbox.Root id={`${name}-disabled-check`} nativeButton render={<button />} defaultChecked disabled onCheckedChange={() => record('disabled')}>
            <Checkbox.Indicator />
          </Checkbox.Root>
          <label id={`${name}-disabled-check-label`} htmlFor={`${name}-disabled-check`}>Disabled checkbox</label>
        </Stack>
        <Radio.Group defaultValue="first" aria-label="Choices" onValueChange={() => record('radio')}>
          <Stack direction="row" gap="small">
            <Radio.Root id={`${name}-radio`} value="first" nativeButton render={<button />}>
              <Radio.Indicator
                id={`${name}-radio-mark`}
                className="default-glyph-customization"
                style={{opacity: 0.75}}
                ref={node => {node?.setAttribute('data-glyph-ref', 'yes');}}
              />
            </Radio.Root>
            <label htmlFor={`${name}-radio`}>First</label>
            <Radio.Root id={`${name}-radio-other`} value="other" nativeButton render={<button />}>
              <Radio.Indicator />
            </Radio.Root>
            <label id={`${name}-radio-other-label`} htmlFor={`${name}-radio-other`}>Other</label>
            <Radio.Root id={`${name}-disabled-radio`} value="disabled" disabled nativeButton render={<button />}>
              <Radio.Indicator />
            </Radio.Root>
            <label id={`${name}-disabled-radio-label`} htmlFor={`${name}-disabled-radio`}>Disabled</label>
          </Stack>
        </Radio.Group>
        <Radio.Group defaultValue="custom" aria-label="Custom choice">
          <Radio.Root id={`${name}-custom-radio`} value="custom" nativeButton render={<button />} aria-label="Custom radio">
            <Radio.Indicator id={`${name}-custom-radio-mark`}><span data-custom-mark="">R</span></Radio.Indicator>
          </Radio.Root>
        </Radio.Group>
        <Stack direction="row" gap="small">
          <Switch.Root id={`${name}-switch`} nativeButton render={<button />} defaultChecked onCheckedChange={() => record('switch')}>
            <Switch.Thumb
              id={`${name}-switch-mark`}
              className="default-glyph-customization"
              style={{opacity: 0.75}}
              ref={node => {node?.setAttribute('data-glyph-ref', 'yes');}}
            />
          </Switch.Root>
          <label id={`${name}-switch-label`} htmlFor={`${name}-switch`}>Enabled</label>
          <Switch.Root id={`${name}-custom-switch`} nativeButton render={<button />} aria-label="Custom switch" defaultChecked>
            <Switch.Thumb id={`${name}-custom-switch-mark`}><span data-custom-mark="">S</span></Switch.Thumb>
          </Switch.Root>
        </Stack>
        <Stack direction="row" gap="small">
          <Switch.Root id={`${name}-disabled-switch`} nativeButton render={<button />} defaultChecked disabled onCheckedChange={() => record('disabled')}>
            <Switch.Thumb />
          </Switch.Root>
          <label id={`${name}-disabled-switch-label`} htmlFor={`${name}-disabled-switch`}>Disabled switch</label>
          <IconButton id={`${name}-icon`} aria-label="Action" onClick={() => record('icon')}>+</IconButton>
          <IconButton id={`${name}-disabled-icon`} aria-label="Disabled action" disabled onClick={() => record('disabled')}>+</IconButton>
        </Stack>
        <Stack direction="row" gap="small">
          <Checkbox.Root nativeButton render={<button />} aria-label="Element-render checkbox" defaultChecked>
            <Checkbox.Indicator id={`${name}-element-check-mark`} render={<span><span data-custom-mark="">E</span></span>} />
          </Checkbox.Root>
          <Checkbox.Root nativeButton render={<button />} aria-label="Callback-render checkbox" defaultChecked>
            <Checkbox.Indicator id={`${name}-callback-check-mark`} render={props => <span {...props}><span data-custom-mark="">C</span></span>} />
          </Checkbox.Root>
          <Radio.Group defaultValue="element" aria-label="Element-render choice">
            <Radio.Root value="element" nativeButton render={<button />} aria-label="Element-render radio">
              <Radio.Indicator id={`${name}-element-radio-mark`} render={<span><span data-custom-mark="">E</span></span>} />
            </Radio.Root>
          </Radio.Group>
          <Radio.Group defaultValue="callback" aria-label="Callback-render choice">
            <Radio.Root value="callback" nativeButton render={<button />} aria-label="Callback-render radio">
              <Radio.Indicator id={`${name}-callback-radio-mark`} render={props => <span {...props}><span data-custom-mark="">C</span></span>} />
            </Radio.Root>
          </Radio.Group>
          <Switch.Root nativeButton render={<button />} aria-label="Element-render switch" defaultChecked>
            <Switch.Thumb id={`${name}-element-switch-mark`} render={<span><span data-custom-mark="">E</span></span>} />
          </Switch.Root>
          <Switch.Root nativeButton render={<button />} aria-label="Callback-render switch" defaultChecked>
            <Switch.Thumb id={`${name}-callback-switch-mark`} render={props => <span {...props}><span data-custom-mark="">C</span></span>} />
          </Switch.Root>
        </Stack>
        <label htmlFor={`${name}-textarea`}>Notes</label>
        <TextArea id={`${name}-textarea`} defaultValue={'Two lines\nof text'} onValueChange={() => record('textarea')} />
        <TextArea id={`${name}-disabled-textarea`} aria-label="Disabled notes" defaultValue="Disabled" disabled />
        <TextArea id={`${name}-invalid-textarea`} aria-label="Invalid notes" defaultValue="Invalid" aria-invalid="true" />
        <label htmlFor={`${name}-search`}>Search</label>
        <Search
          id={`${name}-search`}
          defaultValue="Query"
          onValueChange={() => record('search')}
          endAdornment={<button id={`${name}-search-action`} type="button" aria-label="Search action">+</button>}
        />
        <Search id={`${name}-disabled-search`} aria-label="Disabled search" defaultValue="Disabled" disabled />
        <Search id={`${name}-invalid-search`} aria-label="Invalid search" defaultValue="Invalid" aria-invalid="true" />
        <NavigationItem id={`${name}-navigation`} href="#components-contract" active>Navigation</NavigationItem>
        <Separator id={`${name}-separator`} />
        <Stack direction="row" gap="small" style={{blockSize: '2rem'}}>
          <span>Before</span><Separator id={`${name}-separator-vertical`} orientation="vertical" /><span>After</span>
        </Stack>
        <Table id={`${name}-table`} aria-label="Sample table">
          <TableHead><TableRow id={`${name}-table-head`}><TableHeaderCell scope="col">Name</TableHeaderCell></TableRow></TableHead>
          <TableBody>
            <TableRow id={`${name}-table-first`}><TableCell>First row</TableCell></TableRow>
            <TableRow id={`${name}-table-last`}><TableCell>Last row</TableCell></TableRow>
          </TableBody>
        </Table>
        <output id={`${name}-events`} aria-label={`${name} event counts`}>{JSON.stringify(events)}</output>
      </Stack>
    </section>
  );
}

/** Public APIs only. PencilAppearance imports the surface skin, never the legacy outline stylesheet. */
export function PencilComponentsContract(): React.JSX.Element {
  return (
    <Stack id="components-contract" gap="large" style={{inlineSize: '100%'}}>
      <h1>Full appearance component contracts</h1>
      <Controls name="plain" />
      <PencilAppearance>
        <PencilStrokeOutline id="components-wrapper" style={{inlineSize: '100%'}}>
          <Controls name="pencil" />
          <AppearanceProvider>
            <Controls name="reset" />
            <PencilAppearance><Controls name="deeper" /></PencilAppearance>
          </AppearanceProvider>
          <AppearanceProvider surfaceClassName={pencilSurfaceClassName}>
            <Controls name="surface-only" />
          </AppearanceProvider>
        </PencilStrokeOutline>
      </PencilAppearance>
    </Stack>
  );
}
