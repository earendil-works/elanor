// The modules the integration (`src/index.ts`) provides.

declare module 'virtual:elanor-docs/config' {
  import type {RuntimeConfig} from './content/context.ts';

  const config: RuntimeConfig;
  export default config;
}

declare module 'virtual:elanor-docs/styles' {}

declare module 'virtual:elanor-docs/components' {
  type AstroComponent = (props: Record<string, unknown>) => unknown;

  export const Head: AstroComponent;
  export const Identity: AstroComponent;
  export const BeforeArticle: AstroComponent;
  export const AfterArticle: AstroComponent;
  export const Footer: AstroComponent;
}
