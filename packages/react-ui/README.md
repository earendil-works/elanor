# `@earendil-works/elanor-react-ui`

Elanor components for React, built with Base UI 1.8 and co-located CSS Modules. Products provide the inherited semantic token values.

## Install

```sh
pnpm add @earendil-works/elanor-react-ui react react-dom
```

React and React DOM are peer dependencies. Base UI is included as an internal dependency.

Import exactly one brand stylesheet in the consuming application, for example:

```ts
import '@earendil-works/design-tokens/radius.css';
```

Component CSS Modules use semantic design tokens for appearance. They also use Base UI's documented runtime variables for popup collision bounds, anchor sizing, and toast swipe movement. Runtime geometry is supplied by Base UI; it is not part of a brand's token catalogue. The React package does not import or embed a brand.

## Application setup

Elanor does not declare client boundaries. In Next.js or another React Server Components application, import and compose interactive Elanor components in an application-owned client component (with the framework's client directive). This includes compound APIs such as `Modal.Root`, hooks, and `PaginationLink`. Removing the library directives does not make interactive components Server Components. Ordinary client-rendered applications and traditional React SSR do not need this boundary. See [Next.js client boundaries](https://nextjs.org/docs/app/getting-started/server-and-client-components).

Follow [Base UI's portal setup](https://base-ui.com/react/overview/quick-start): isolate the application's content root and position the body relatively. `AppLayout.Root` already provides isolation; applications with their own layout must supply it themselves.

```css
body {
  position: relative;
}

.appRoot {
  isolation: isolate;
}
```

Keep portals outside that isolated content root. Modals, anchored popups, and toasts use automatic stacking in portal order, so a popup opened inside a modal is not trapped behind an independently elevated backdrop. If an application customizes portal containers or z-index, it owns the complete stacking context. The relative body also supports Base UI's iOS Safari absolute-backdrop workaround after page scrolling.

For RTL, set both the DOM direction and Base UI's direction context. Elanor re-exports `DirectionProvider`, `useDirection`, and their public types directly:

```tsx
import {DirectionProvider} from '@earendil-works/elanor-react-ui';

// Also set <html dir="rtl"> so body-portaled content inherits the same direction.
<DirectionProvider direction="rtl">
  <App />
</DirectionProvider>
```

For mixed-direction regions, also set `dir` on any portaled popup in that region. The provider controls Base UI keyboard/positioning behavior; the DOM direction controls CSS layout. See [DirectionProvider](https://base-ui.com/react/utils/direction-provider).

## Figma library coverage

```tsx
import {
  AppLayout,
  Button,
  Card,
  Checkbox,
  CodeSnippet,
  ContextualMenu,
  ControlAndLabel,
  Dropdown,
  EmptyState,
  Field,
  Heading,
  IconButton,
  Input,
  KeyValuePair,
  Link,
  Modal,
  NavigationItem,
  NavigationMenu,
  Page,
  PageHeader,
  Pagination,
  PartnerLogos,
  Popover,
  ProgressiveDisclosure,
  ProjectSwitcher,
  Radio,
  Search,
  SearchAndFilterBar,
  Section,
  Separator,
  SegmentedControl,
  SelectionControlAndLabel,
  SideNavigation,
  SocialLogin,
  Stack,
  Switch,
  Table,
  TableOfContents,
  Tabs,
  Text,
  TextArea,
  Toast,
  TopNavigation,
} from '@earendil-works/elanor-react-ui';
```

- `Button` uses the Figma `hierarchy`, `semantic`, and `density` axes.
- `IconButton` accepts the product's icon as its child; consumers must provide an accessible name through `aria-label` or `aria-labelledby`.
- Public component names follow the Figma library: `ContextualMenu`, `Modal`, `Input`, `Radio`, `ControlAndLabel`, and `SelectionControlAndLabel` are the canonical APIs.
- Interactive components use Base UI compound parts. Unstyled parts are direct aliases; wrappers exist only where the library adds token styling, structure, defaults, or API adaptation.
- `Checkbox`, `Dropdown`, `Popover`, `ProgressiveDisclosure`, `SegmentedControl`, `Switch`, `Tabs`, and `Toast` provide styled Base UI interaction primitives.
- `Card`, `CodeSnippet`, `ControlAndLabel`, `EmptyState`, `KeyValuePair`, `Link`, `Page`, `PageHeader`, `Pagination`, `Search`, `SearchAndFilterBar`, `Section`, `SelectionControlAndLabel`, `Table`, and `TableOfContents` provide the corresponding Figma structures.
- `PartnerLogos` and `SocialLogin` own layout and interaction styling while logo artwork is supplied by the consuming product.
- `NavigationItem` covers simple top-level links; `NavigationMenu` provides Base UI-powered flyouts.
- `SideNavigation` provides grouped lists and links with optional leading and trailing icon slots.
- `TopNavigation`, `AppLayout`, `PageHeader`, and `EmptyState` expose compound parts so applications control their content, DOM attributes, and order. Brand artwork remains application-owned.

## Composition and types

Styled Base UI parts preserve `render`, state-aware `className`/`style`, events, and refs. Unstyled parts retain their upstream implementation directly. For a custom link rendered through a button, use `nativeButton={false}` as described by [Base UI composition](https://base-ui.com/react/handbook/composition).

Compound types are available as named type-only exports from this package, for example `ModalRootProps`, `ModalRootActions`, `ModalRootChangeEventDetails`, `ContextualMenuCheckboxItemProps`, `DropdownRootProps`, `RadioGroupProps`, `SegmentedControlProps`, `ToastObject`, and `ToastManager`. Styled wrappers do not inherit the upstream component type namespaces; use these named exports when declaring props or callbacks.

Public types live alongside their components and are exported through the package entry point. Unchanged contracts reuse Base UI's types, including their generics; customized props such as `ButtonProps` and `ContextualMenuItemProps` describe Elanor's actual API. Consumers do not need a separate Base UI import for these contracts. Brand stylesheets change token values, not component types.

Only consumer-facing component contracts are exposed: props, render state, change events, actions, handles, and toast-management types. Internal tab-layout metadata, toast-manager events, and redundant type aliases are not part of Elanor's public API.

`ContextualMenu` exposes the full Base UI Menu anatomy, including checkbox and radio items, their indicators, radio groups, backdrop, arrow, viewport, and handles. `NavigationMenu` also exposes its backdrop and arrow. Arrows and backdrops are unstyled parts; consumers can supply artwork or styles when needed. `ContextualMenu` follows the Figma name for a trigger-opened menu; it uses Base UI Menu, not the separate right-click Context Menu primitive.

## Layout

```tsx
import {AppLayout, Page, PageHeader, TopNavigation} from '@earendil-works/elanor-react-ui';

<AppLayout.Root>
  <a href="#content">Skip to content</a>
  <AppLayout.Header>
    <TopNavigation.Root>
      <TopNavigation.Identity>Brand and project switcher</TopNavigation.Identity>
      <TopNavigation.Navigation>Navigation links</TopNavigation.Navigation>
      <TopNavigation.Actions>Account actions</TopNavigation.Actions>
    </TopNavigation.Root>
  </AppLayout.Header>
  <AppLayout.Body>
    <AppLayout.Sidebar aria-label="Workspace">Sidebar navigation</AppLayout.Sidebar>
    <AppLayout.Content id="content" tabIndex={-1}>
      <Page>
        <PageHeader.Root>
          <PageHeader.Row>
            <PageHeader.Title level={1}>Projects</PageHeader.Title>
            <PageHeader.Actions>Page actions</PageHeader.Actions>
          </PageHeader.Row>
          <PageHeader.Description>Manage your projects.</PageHeader.Description>
        </PageHeader.Root>
      </Page>
    </AppLayout.Content>
  </AppLayout.Body>
</AppLayout.Root>
```

`AppLayout.Content` renders the main landmark. `Page` renders a `<div>` and can also be placed inside an application's own `<main>`. Heading components require an explicit semantic `level`, independently of their visual size.

`EmptyState` offers `Root`, `Illustration`, `Body`, `Copy`, `Title`, `Description`, and `Actions`. Compose the desired parts; its `Title` also requires `level`.

## Inputs

```tsx
import {Button, ControlAndLabel, Input, Stack, TextArea} from '@earendil-works/elanor-react-ui';

<form>
  <Stack gap="large">
    <ControlAndLabel
      name="project"
      label="Project name"
      description="Shown to everyone in the workspace."
    >
      <Input required minLength={3} />
    </ControlAndLabel>

    <ControlAndLabel name="notes" label="Notes">
      <TextArea rows={5} />
    </ControlAndLabel>

    <Button type="submit">Save changes</Button>
  </Stack>
</form>
```

`Input` and `TextArea` support Base UI field validation and `onValueChange(value, details)`. Their dimensions match the Figma components: 24px for `Input` and 72px for `TextArea`.

Use `Field` for full control of labeling and validation. `ControlAndLabel` is an optional shorthand for native inputs. For button-based controls such as `Dropdown`, [Base UI recommends a non-native label](https://base-ui.com/react/components/field):

```tsx
<Field.Root name="region">
  <Field.Label nativeLabel={false} render={<span />}>Region</Field.Label>
  <Dropdown.Root items={[{label: 'Europe', value: 'eu'}]}>
    <Dropdown.Trigger><Dropdown.Value /><Dropdown.Icon /></Dropdown.Trigger>
    <Dropdown.Portal>
      <Dropdown.Positioner>
        <Dropdown.Popup>
          <Dropdown.List>
            <Dropdown.Item value="eu"><Dropdown.ItemText>Europe</Dropdown.ItemText></Dropdown.Item>
          </Dropdown.List>
        </Dropdown.Popup>
      </Dropdown.Positioner>
    </Dropdown.Portal>
  </Dropdown.Root>
  <Field.Description>Choose a deployment region.</Field.Description>
  <Field.Error />
</Field.Root>
```

`Field.Error` accepts Base UI's `match` prop, and `Field.Validity` and `Field.Item` remain available for custom validation output and grouped controls. `TextArea` sends textarea-specific events, attributes, and its ref to the native `<textarea>` through `Field.Control`'s `render` API; value state and field registration remain with Base UI.

## Radio

```tsx
import {Radio, SelectionControlAndLabel, Stack} from '@earendil-works/elanor-react-ui';

<Radio.Group defaultValue="private" aria-label="Visibility">
  <Stack gap="small">
    <SelectionControlAndLabel
      control={<Radio.Root value="private"><Radio.Indicator /></Radio.Root>}
    >
      Private
    </SelectionControlAndLabel>
    <SelectionControlAndLabel
      control={<Radio.Root value="public"><Radio.Indicator /></Radio.Root>}
    >
      Public
    </SelectionControlAndLabel>
  </Stack>
</Radio.Group>
```

`Radio.Root` and `Radio.Group` accept the same Base UI value domain, including numbers and objects. `Radio.Group` is the unwrapped Base UI primitive. `Radio.Root` and `SegmentedControl` preserve generic inference and forward refs.

## Modal

```tsx
import {Button, Modal, Text} from '@earendil-works/elanor-react-ui';

<Modal.Root>
  <Modal.Trigger render={<Button />}>Open details</Modal.Trigger>
  <Modal.Portal>
    <Modal.Backdrop />
    <Modal.Viewport>
      <Modal.Popup>
        <Modal.Title>Details</Modal.Title>
        <Modal.Description>Review before continuing.</Modal.Description>
        <Modal.Body><Text>Modal content.</Text></Modal.Body>
        <Modal.Actions>
          <Modal.Close render={<Button />}>Close</Modal.Close>
        </Modal.Actions>
      </Modal.Popup>
    </Modal.Viewport>
  </Modal.Portal>
</Modal.Root>
```

When tokens are scoped below the document root, pass the themed element to `Modal.Portal` through `container`.

## Other primitives

- `Text` renders `<span>`.
- `Heading` separates semantic `level` from the Figma visual sizes `1`, `2`, and `3`.
- `Stack` uses the Figma gap names: `xxSmall`, `xSmall`, `small`, `medium`, `large`, `xLarge`, and `auto`.
- `Badge` provides token-based status presentation.

## Interaction sizing

`IconButton`, standalone `Checkbox.Root`, `Radio.Root`, `Switch.Root`, and `Toast.Close` have targets at least 24px high through the shared size tokens, increasing to 48px for coarse pointers. `Tabs.Tab` includes its vertical padding in its target, with the same minimum heights. Checkbox and radio boxes and icon artwork remain 16px; the switch track remains 32 × 16px, with its thumb derived from track height and internal padding. These dimensions occupy real layout space, so adjacent targets do not overlap. `SelectionControlAndLabel` also provides a clickable label. This deliberately increases the footprint of the compact Figma controls for pointer accessibility.

Popups use `--available-width` and `--available-height` to constrain overflow; `Dropdown` also uses `--anchor-width`. Compose `Dropdown.List` inside `Dropdown.Popup`: the list owns scrolling in both aligned and non-aligned positioning. Kept-mounted selection indicators reserve their space but hide the inactive mark.

Toasts grow with title/description content and hide limited notifications. The viewport constrains and scrolls the complete stack. Swipe dismissal defaults to `swipeDirection={[]}` to preserve native scrolling, including on touch devices. Include `Toast.Close` for explicit dismissal. Consumers can opt into Base UI swipe directions for a non-scrolling presentation; its swipe movement variables remain supported. The library imposes no animation.

## Tabs and segmented controls

Both components support horizontal and vertical orientation. Include `Tabs.Indicator` once inside `Tabs.List`; it owns the active selection underline and follows Base UI's measured tab geometry, including RTL. Tabs do not add a second active underline automatically.

```tsx
<Tabs.Root defaultValue="overview" orientation="horizontal">
  <Tabs.List>
    <Tabs.Tab value="overview">Overview</Tabs.Tab>
    <Tabs.Tab value="details">Details</Tabs.Tab>
    <Tabs.Indicator />
  </Tabs.List>
  <Tabs.Panel value="overview">Overview content</Tabs.Panel>
  <Tabs.Panel value="details">Details content</Tabs.Panel>
</Tabs.Root>
```

## Token linting

Use the shared design-token plugin's strict configuration against the selected brand catalogue. It permits semantic tokens used through equivalent CSS paint mechanisms, while continuing to reject hardcoded design values, unknown variables, primitive tokens, and incompatible roles/types. No Elanor-specific semantic-role overrides or blanket rule disables are required.

The only custom-property exceptions needed by these modules are Base UI's runtime geometry variables. Supply this exact list through the strict configuration's `allowCustomProperties` option; do not use a wildcard:

```ts
allowCustomProperties: [
  '--anchor-width',
  '--available-width',
  '--available-height',
  '--active-tab-left',
  '--active-tab-top',
  '--active-tab-width',
  '--active-tab-height',
  '--toast-swipe-movement-x',
  '--toast-swipe-movement-y',
]
```
