# `@earendil-works/elanor-react`

React components built with Base UI and CSS Modules.

## Install

```sh
pnpm add @earendil-works/elanor-react react react-dom
```

Requires React 18–19 and a bundler that supports CSS Modules in dependencies.

## Usage

Install the [fonts](https://github.com/earendil-works/elanor/tree/main/packages/fonts) and [brand tokens](https://github.com/earendil-works/elanor/tree/main/packages/design-tokens) from the internal package source, then import them once:

```tsx
import '@earendil-works/elanor-fonts/earendil.css';
import '@earendil-works/elanor-fonts/commit-mono.css';
import '@earendil-works/design-tokens/radius.css';
import {Button} from '@earendil-works/elanor-react';

<Button>Continue</Button>;
```

- [Components and examples](https://github.com/earendil-works/elanor/tree/main/packages/react/src)
- [Application setup](https://github.com/earendil-works/elanor/blob/main/packages/react/docs/application-setup.md)
