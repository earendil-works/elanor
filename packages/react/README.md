# `@earendil-works/elanor-react`

React components built with Base UI and CSS Modules.

## Install

```sh
pnpm add @earendil-works/elanor-react react react-dom
```

Requires React 17–19 and a bundler that supports CSS Modules in dependencies.

## Usage

Install the [brand tokens](https://github.com/earendil-works/elanor/tree/main/packages/design-tokens) from the internal package source, then import one brand stylesheet:

```tsx
import '@earendil-works/design-tokens/radius.css';
import {Button} from '@earendil-works/elanor-react';

<Button>Continue</Button>
```

- [Components and examples](https://github.com/earendil-works/elanor/tree/main/packages/react/src)
- [Application setup](https://github.com/earendil-works/elanor/blob/main/packages/react/docs/application-setup.md)

## Appearance

`AppearanceProvider` accepts optional `surfaceClassName` and `indicatorClassName` values. Omitted/null values select ordinary rendering; nested providers replace both selections. Scope follows React ancestry, including portals.

For pencil styling, use the optional [React strokes adapter](../strokes/react/README.md).
