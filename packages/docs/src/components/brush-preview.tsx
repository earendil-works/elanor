import {useState, useRef} from 'react';
import {Button, Input, TextArea, Separator, Search, Field, Card, Checkbox, Radio, Switch, IconButton, SocialLogin, type BrushVariant} from '@earendil-works/elanor-react';
import {DropdownExample} from '../../../react/src/dropdown/dropdown.example.tsx';
import {SegmentedControlExample} from '../../../react/src/segmented-control/segmented-control.example.tsx';
import {TabsExample} from '../../../react/src/tabs/tabs.example.tsx';
import styles from './brush-preview.module.css';

const variants: BrushVariant[] = [0, 1, 2, 3, 4, 5];
export function BrushPreview() {
  const [width, setWidth] = useState(320);
  const [dark, setDark] = useState(false);
  const [count, setCount] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className={styles.root}>
      <header>
        <p className={styles.eyebrow}>NOIR / BRUSH LAB</p>
        <h1>A little less perfect.</h1>
        <p>One SVG brush. Six continuous outlines. Fixed corners, stretching edges.</p>
      </header>
      <div className={styles.tools}>
        <label>Width · {width}px <input aria-label="Preview width" type="range" min="140" max="680" value={width} onChange={(event) => setWidth(Number(event.target.value))} /></label>
        <Button hierarchy="secondary" onClick={() => {
          setDark(!dark);
          document.documentElement.dataset.colorScheme = dark ? 'light' : 'dark';
        }}>Switch to {dark ? 'light' : 'dark'}</Button>
      </div>
      <section>
        <h2>Six takes on the same outline</h2>
        <p>Each texture stays put through hover, focus, clicks, and resizing.</p>
        <div className={styles.variants}>
          {variants.map((variant) => <div key={variant}><span className={styles.caption}>0{variant + 1}</span><Button hierarchy="secondary" brushVariant={variant}>Same button</Button></div>)}
        </div>
      </section>
      <Separator />
      <section>
        <h2>Stretch, don’t redraw</h2>
        <div className={styles.resizable} style={{width}}>
          <Button data-testid="stretch-button" hierarchy="secondary" brushVariant={2} style={{width: '100%'}} onClick={() => setCount(count + 1)}>Click count: {count}</Button>
          <Field.Root>
            <Field.Label>Project name</Field.Label>
            <Input ref={input} placeholder="A pencil-drawn input" brushVariant={3} />
          </Field.Root>
          <Search aria-label="Search projects" placeholder="Search projects" />
          <TextArea aria-label="Notes" placeholder="Write a few notes…" brushVariant={4} />
          <Separator brushVariant={1} />
        </div>
      </section>
      <section>
        <h2>State follows the component</h2>
        <div className={styles.row}>
          <Button>Primary</Button>
          <Button hierarchy="secondary" semantic="information">Information</Button>
          <Button hierarchy="secondary" semantic="negative">Destructive</Button>
          <Button hierarchy="tertiary">Ghost</Button>
          <Button hierarchy="secondary" disabled>Disabled</Button>
          <Button hierarchy="secondary" onClick={() => input.current?.focus()}>Focus input via ref</Button>
        </div>
        <div className={styles.fields}>
          <Input aria-label="Invalid input" aria-invalid="true" defaultValue="Needs attention" />
          <Input aria-label="Disabled input" disabled defaultValue="Not editable" />
        </div>
      </section>
      <section>
        <h2>Small controls, circles & pills</h2>
        <div className={styles.row}>
          <Checkbox.Root aria-label="Include notes"><Checkbox.Indicator /></Checkbox.Root>
          <Switch.Root aria-label="Notifications"><Switch.Thumb /></Switch.Root>
          <Radio.Group defaultValue="first" aria-label="Drawing mode" style={{display: 'flex'}}>
            <Radio.Root value="first" aria-label="Pencil"><Radio.Indicator /></Radio.Root>
            <Radio.Root value="second" aria-label="Ink"><Radio.Indicator /></Radio.Root>
          </Radio.Group>
          <IconButton aria-label="Add">+</IconButton>
          <SegmentedControlExample />
        </div>
        <div className={styles.fields}>
          <Card label="A reusable surface" value="One brush" description="The same border system, without runtime SVG drawing." />
          <div className={styles.resizable}><DropdownExample /><SocialLogin>Continue with an account</SocialLogin></div>
        </div>
      </section>
      <section><h2>Indicators & dividers</h2><TabsExample /></section>
      <section>
        <h2>One-slice lines</h2>
        <div className={styles.lines}>
          {variants.map((variant) => <Separator key={variant} brushVariant={variant} />)}
        </div>
        <div className={styles.verticalLines}>
          {variants.map((variant) => <Separator key={variant} orientation="vertical" brushVariant={variant} />)}
        </div>
      </section>
      <section dir="rtl">
        <h2>RTL · نفس الحدود</h2>
        <div className={styles.row}><Button hierarchy="secondary">متابعة</Button><Input aria-label="اسم المشروع" placeholder="اسم المشروع" /></div>
      </section>
    </div>
  );
}
