# `@earendil-works/elanor-react`

React components built with Base UI and CSS Modules.

## Install

```sh
npm install @earendil-works/elanor-react @earendil-works/elanor-fonts @earendil-works/design-tokens react react-dom
```

Requires React 19.2 or later. Styles are precompiled; your bundler doesn't need CSS Modules support.

## Usage

Import the fonts, one brand's tokens, and the component stylesheet once:

```tsx
import '@earendil-works/elanor-fonts/mallos-serif.css';
import '@earendil-works/elanor-fonts/commit-mono.css';
import '@earendil-works/design-tokens/radius.css';
import '@earendil-works/elanor-react/elanor.min.css';
import {Button} from '@earendil-works/elanor-react';

<Button>Continue</Button>;
```

- [Components and examples](https://github.com/earendil-works/elanor/tree/main/packages/react/src)
- [Application setup](https://elanor.earendil.com/application-setup.md)
