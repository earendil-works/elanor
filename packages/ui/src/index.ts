export {ElnrButton, type ButtonSize, type ButtonVariant} from './button.js';
export {ElnrTextArea, ElnrTextField} from './field.js';
export {ElnrChoice, ElnrChoiceList} from './choice-list.js';
export {ElnrDialog, type DialogCloseReason} from './dialog.js';
export {ElnrStack} from './stack.js';
export {ElnrBadge, type BadgeTone} from './badge.js';
export {ElnrBox, ElnrHeading, ElnrText} from './content.js';

import {ElnrBadge} from './badge.js';
import {ElnrButton} from './button.js';
import {ElnrChoice, ElnrChoiceList} from './choice-list.js';
import {ElnrBox, ElnrHeading, ElnrText} from './content.js';
import {ElnrDialog} from './dialog.js';
import {ElnrTextArea, ElnrTextField} from './field.js';
import {ElnrStack} from './stack.js';

const elements = {
  'elnr-badge': ElnrBadge,
  'elnr-box': ElnrBox,
  'elnr-button': ElnrButton,
  'elnr-choice': ElnrChoice,
  'elnr-choice-list': ElnrChoiceList,
  'elnr-dialog': ElnrDialog,
  'elnr-heading': ElnrHeading,
  'elnr-stack': ElnrStack,
  'elnr-text-area': ElnrTextArea,
  'elnr-text-field': ElnrTextField,
  'elnr-text': ElnrText,
} as const;

for (const [name, constructor] of Object.entries(elements)) {
  if (!customElements.get(name)) customElements.define(name, constructor);
}

declare global {
  interface HTMLElementTagNameMap {
    'elnr-badge': ElnrBadge;
    'elnr-box': ElnrBox;
    'elnr-button': ElnrButton;
    'elnr-choice': ElnrChoice;
    'elnr-choice-list': ElnrChoiceList;
    'elnr-dialog': ElnrDialog;
    'elnr-heading': ElnrHeading;
    'elnr-stack': ElnrStack;
    'elnr-text-area': ElnrTextArea;
    'elnr-text-field': ElnrTextField;
    'elnr-text': ElnrText;
  }
}
