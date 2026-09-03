import {css} from 'lit';

export const controlStyles = css`
  :host {
    color: var(--semantic-color-text-primary);
    font: var(--semantic-typography-ui-primary);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :where(button, input, textarea) {
    font: inherit;
  }
  :where(button, input, textarea) {
    touch-action: manipulation;
  }

  :where(button, input, textarea):focus-visible {
    outline: var(--semantic-dimension-border-width-large) solid var(--semantic-color-focus-ring);
  }

  :where(input, textarea):focus-visible {
    outline-offset: calc(-1 * var(--semantic-dimension-border-width-small));
  }

  :where(button):focus-visible {
    outline-offset: var(--semantic-dimension-border-width-medium);
  }

  @media (max-width: 38rem) {
    :host {
      font-size: var(--semantic-typography-prose-primary-font-size);
      line-height: var(--semantic-typography-prose-primary-line-height);
    }
  }

  @media (forced-colors: active) {
    :where(button, input, textarea) {
      border-color: ButtonBorder;
    }
  }
`;

export function valueEvent(value: string): CustomEvent<{value: string}> {
  return new CustomEvent('elnr-input', {
    bubbles: true,
    composed: true,
    detail: {value},
  });
}
