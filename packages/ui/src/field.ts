import {css, html, LitElement, type PropertyValues} from 'lit';
import {controlStyles, valueEvent} from './shared.js';

const fieldStyles = css`
  .field {
    display: grid;
    gap: var(--semantic-dimension-space-control-gap-small);
  }

  label {
    color: var(--semantic-color-text-primary);
    font-weight: var(--semantic-typography-heading-app-6-font-weight);
  }

  :where(input, textarea) {
    background: var(--semantic-color-background-surface);
    border: var(--semantic-dimension-border-width-small) solid var(--semantic-color-border-primary);
    border-radius: var(--semantic-dimension-radius-default);
    color: var(--semantic-color-text-primary);
    inline-size: 100%;
    min-block-size: var(--semantic-dimension-size-large);
    padding-block: var(--semantic-dimension-space-control-padding-block-medium);
    padding-inline: var(--semantic-dimension-space-control-padding-inline-medium);
  }

  @media (max-width: 38rem) {
    :where(input, textarea) {
      min-block-size: var(--semantic-dimension-size-x-large);
    }
  }

  textarea {
    min-block-size: calc(var(--semantic-dimension-size-x-large) * 2);
    resize: vertical;
  }

  :where(input, textarea)::placeholder {
    color: var(--semantic-color-text-secondary);
  }

  :where(input, textarea):hover:not(:disabled) {
    border-color: var(--semantic-color-border-primary-hover);
  }

  :where(input, textarea)[aria-invalid='true'] {
    border-color: var(--semantic-color-border-negative);
  }

  :where(input, textarea):disabled {
    cursor: not-allowed;
    opacity: var(--semantic-number-opacity-disabled);
  }

  .message {
    color: var(--semantic-color-text-secondary);
    font: var(--semantic-typography-ui-secondary);
    margin: 0;
  }

  .message[data-error] {
    color: var(--semantic-color-text-negative);
  }
`;

abstract class ElnrFieldBase extends LitElement {
  static formAssociated = true;
  static properties = {
    name: {type: String, reflect: true},
    label: {type: String},
    value: {type: String},
    defaultValue: {type: String, attribute: 'default-value'},
    placeholder: {type: String},
    autocomplete: {type: String, reflect: true},
    helper: {type: String},
    error: {type: String},
    required: {type: Boolean, reflect: true},
    disabled: {type: Boolean, reflect: true},
  };

  name = '';
  label = '';
  value = '';
  defaultValue = '';
  placeholder = '';
  autocomplete: 'off' | 'on' | 'name' | 'email' = 'off';
  helper = '';
  error = '';
  required = false;
  disabled = false;
  protected readonly internals = this.attachInternals();

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.value === '' && this.defaultValue !== '') this.value = this.defaultValue;
  }

  protected override updated(_changed: PropertyValues): void {
    this.internals.setFormValue(this.disabled ? null : this.value);
    const missing = this.required && this.value.trim() === '';
    if (this.error !== '') this.internals.setValidity({customError: true}, this.error);
    else if (missing) this.internals.setValidity({valueMissing: true}, 'This field is required.');
    else this.internals.setValidity({});
  }

  protected changeValue(value: string): void {
    this.value = value;
    this.dispatchEvent(valueEvent(value));
  }

  override focus(options?: FocusOptions): void {
    this.renderRoot.querySelector<HTMLElement>('[data-control]')?.focus(options);
  }
}

export class ElnrTextField extends ElnrFieldBase {
  static styles = [controlStyles, fieldStyles];

  render() {
    const message = this.error || this.helper;
    return html`
      <div class="field">
        <label for="control">${this.label}</label>
        <input
          data-control
          type="text"
          id="control"
          name=${this.name}
          autocomplete=${this.autocomplete}
          .value=${this.value}
          placeholder=${this.placeholder}
          ?required=${this.required}
          ?disabled=${this.disabled}
          aria-invalid=${this.error ? 'true' : 'false'}
          aria-describedby=${message ? 'message' : ''}
          @input=${(event: InputEvent) => this.changeValue((event.currentTarget as HTMLInputElement).value)}
        />
        ${message ? html`<p id="message" class="message" ?data-error=${Boolean(this.error)}>${message}</p>` : null}
      </div>
    `;
  }
}

export class ElnrTextArea extends ElnrFieldBase {
  static styles = [controlStyles, fieldStyles];

  render() {
    const message = this.error || this.helper;
    return html`
      <div class="field">
        <label for="control">${this.label}</label>
        <textarea
          data-control
          id="control"
          name=${this.name}
          autocomplete=${this.autocomplete}
          .value=${this.value}
          placeholder=${this.placeholder}
          ?required=${this.required}
          ?disabled=${this.disabled}
          aria-invalid=${this.error ? 'true' : 'false'}
          aria-describedby=${message ? 'message' : ''}
          @input=${(event: InputEvent) => this.changeValue((event.currentTarget as HTMLTextAreaElement).value)}
        ></textarea>
        ${message ? html`<p id="message" class="message" ?data-error=${Boolean(this.error)}>${message}</p>` : null}
      </div>
    `;
  }
}
