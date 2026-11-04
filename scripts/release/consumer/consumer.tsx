import {SearchIcon as BoiledSearchIcon} from '@earendil-works/elanor-icons-boiled-react/search';
import {SearchIcon} from '@earendil-works/elanor-icons-react/search';
import {RadiusSymbol} from '@earendil-works/elanor-logos-react/radius/symbol';
import {
  Button,
  Collapsible,
  createCollapsible,
  enhance,
  type BehaviorFactory,
} from '@earendil-works/elanor-react';
import type {createStrictConfig} from '@earendil-works/stylelint-plugin-design-tokens';

export const configOptions: Parameters<typeof createStrictConfig>[0] = {
  catalogue: '/unused-in-type-test.json',
};
export const example = (
  <Button>
    <SearchIcon aria-label="Search" />
    <BoiledSearchIcon aria-hidden />
    <RadiusSymbol aria-hidden />
    Continue
  </Button>
);

export const staticExample = (
  <Collapsible.StaticRoot>
    <Collapsible.StaticTrigger>Details</Collapsible.StaticTrigger>
    <Collapsible.StaticPanel>Server-rendered content</Collapsible.StaticPanel>
  </Collapsible.StaticRoot>
);
export const behaviors: Readonly<Record<string, BehaviorFactory>> = {
  collapsible: createCollapsible,
};
export {enhance};
