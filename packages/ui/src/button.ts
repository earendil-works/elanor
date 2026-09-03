import {css, html, LitElement} from 'lit';
import {controlStyles} from './shared.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium';

export class ElnrButton extends LitElement {
  static formAssociated = true;
  static properties = {
    variant: {type: String, reflect: true},
    size: {type: String, reflect: true},
    type: {type: String, reflect: true},
    disabled: {type: Boolean, reflect: true},
    pending: {type: Boolean, reflect: true},
  };

  static styles = [
    controlStyles,
    css`
      :host {
        vertical-align: middle;
      }

      button {
        align-items: center;
        background: var(--button-background);
        border: var(--semantic-dimension-border-width-small) solid var(--button-border);
        border-radius: var(--semantic-dimension-radius-default);
        color: var(--button-color);
        cursor: pointer;
        display: inline-flex;
        font-weight: var(--semantic-typography-heading-app-6-font-weight);
        gap: var(--semantic-dimension-space-control-gap-small);
        justify-content: center;
        min-block-size: var(--semantic-dimension-size-large);
        padding-block: var(--semantic-dimension-space-control-padding-block-medium);
        padding-inline: var(--semantic-dimension-space-control-padding-inline-medium);
      }

      button:hover:not(:disabled) {
        background: var(--button-background-hover);
        border-color: var(--button-border-hover);
      }

      button:active:not(:disabled) {
        background: var(--button-background-active);
      }

      button:disabled {
        cursor: not-allowed;
        opacity: var(--semantic-number-opacity-disabled);
      }

      :host([size='small']) button {
        min-block-size: var(--semantic-dimension-size-medium);
        padding-block: var(--semantic-dimension-space-control-padding-block-small);
        padding-inline: var(--semantic-dimension-space-control-padding-inline-small);
      }

      @media (max-width: 38rem) {
        button,
        :host([size='small']) button {
          min-block-size: var(--semantic-dimension-size-x-large);
        }
      }

      :host([variant='primary']) {
        --button-background: var(--semantic-color-background-fill-primary);
        --button-background-active: var(--semantic-color-background-fill-primary-active);
        --button-background-hover: var(--semantic-color-background-fill-primary-hover);
        --button-border: var(--semantic-color-background-fill-primary);
        --button-border-hover: var(--semantic-color-background-fill-primary-hover);
        --button-color: var(--semantic-color-text-on-primary-fill);
      }

      :host([variant='secondary']) {
        --button-background: var(--semantic-color-background-fill-secondary);
        --button-background-active: var(--semantic-color-background-fill-secondary-active);
        --button-background-hover: var(--semantic-color-background-fill-secondary-hover);
        --button-border: var(--semantic-color-border-primary);
        --button-border-hover: var(--semantic-color-border-primary-hover);
        --button-color: var(--semantic-color-text-on-secondary-fill);
      }

      :host([variant='ghost']) {
        --button-background: var(--semantic-color-background-fill-ghost);
        --button-background-active: var(--semantic-color-background-fill-ghost-active);
        --button-background-hover: var(--semantic-color-background-fill-ghost-hover);
        --button-border: var(--semantic-color-background-fill-ghost);
        --button-border-hover: var(--semantic-color-border-secondary);
        --button-color: var(--semantic-color-text-primary);
      }

      :host([variant='danger']) {
        --button-background: var(--semantic-color-background-fill-secondary-negative);
        --button-background-active: var(--semantic-color-background-fill-secondary-negative-active);
        --button-background-hover: var(--semantic-color-background-fill-secondary-negative-hover);
        --button-border: var(--semantic-color-border-negative);
        --button-border-hover: var(--semantic-color-border-negative);
        --button-color: var(--semantic-color-text-on-secondary-fill-negative);
      }
    `,
  ];

  variant: ButtonVariant = 'secondary';
  size: ButtonSize = 'medium';
  type: 'button' | 'submit' | 'reset' = 'button';
  disabled = false;
  pending = false;
  readonly #internals = this.attachInternals();

  render() {
    return html`
      <button
        type=${this.type}
        ?disabled=${this.disabled || this.pending}
        aria-busy=${this.pending ? 'true' : 'false'}
        @click=${this.#activate}
      >
        <slot></slot>
      </button>
    `;
  }

  override focus(options?: FocusOptions): void {
    this.renderRoot.querySelector<HTMLButtonElement>('button')?.focus(options);
  }

  #activate(event: MouseEvent): void {
    const form = this.#internals.form;
    if (!form || this.type === 'button') return;
    event.preventDefault();
    if (this.type === 'reset') form.reset();
    else form.requestSubmit();
  }
}
