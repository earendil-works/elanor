// Behaviors for components rendered on the server, without React in the browser. Exported as
// `@earendil-works/elanor-react/behaviors`; nothing here imports React.
export {enhance} from './utils/enhance.ts';
export type {Behavior, BehaviorFactory} from './utils/enhance.ts';

export {createCopyButton} from './copy-button/copy-button.behavior.ts';
