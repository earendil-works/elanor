import {css, html, LitElement, type PropertyValues} from 'lit';
import {controlStyles, valueEvent} from './shared.js';

interface ChoiceOption {
  value: string;
  label: string;
  disabled: boolean;
}

export class ElnrChoice extends HTMLElement {}

export class ElnrChoiceList extends LitElement {
  static formAssociated = true;
  static properties = {
    name: {type: String, reflect: true},
    label: {type: String},
    value: {type: String},
    defaultValue: {type: String, attribute: 'default-value'},
    error: {type: String},
    required: {type: Boolean, reflect: true},
    disabled: {type: Boolean, reflect: true},
    options: {state: true},
  };

  static styles = [
    controlStyles,
    css`
      fieldset {
        border: 0;
        display: grid;
        gap: var(--semantic-dimension-space-control-gap-medium);
        margin: 0;
        min-inline-size: 0;
        padding: 0;
      }

      legend {
        color: var(--semantic-color-text-primary);
        font-weight: var(--semantic-typography-heading-app-6-font-weight);
        padding: 0;
      }

      .options {
        display: grid;
        gap: var(--semantic-dimension-space-control-gap-small);
      }

      label {
        align-items: center;
        border-radius: var(--semantic-dimension-radius-default);
        cursor: pointer;
        display: flex;
        gap: var(--semantic-dimension-space-control-gap-medium);
        min-block-size: var(--semantic-dimension-size-large);
        padding-block: var(--semantic-dimension-space-control-padding-block-small);
        padding-inline: var(--semantic-dimension-space-control-padding-inline-small);
      }

      label:hover {
        background: var(--semantic-color-background-fill-ghost-hover);
      }

      input {
        accent-color: var(--semantic-color-background-radio-selected);
        block-size: var(--semantic-dimension-size-x-small);
        flex: none;
        inline-size: var(--semantic-dimension-size-x-small);
        margin: 0;
      }

      @media (max-width: 38rem) {
        label {
          min-block-size: var(--semantic-dimension-size-x-large);
        }

        input {
          block-size: var(--semantic-dimension-size-small);
          inline-size: var(--semantic-dimension-size-small);
        }
      }

      input:disabled,
      fieldset:disabled label {
        cursor: not-allowed;
        opacity: var(--semantic-number-opacity-disabled);
      }

      .error {
        color: var(--semantic-color-text-negative);
        font: var(--semantic-typography-ui-secondary);
        margin: 0;
      }
    `,
  ];

  name = '';
  label = '';
  value = '';
  defaultValue = '';
  error = '';
  required = false;
  disabled = false;
  private options: ChoiceOption[] = [];
  readonly #internals = this.attachInternals();
  readonly #observer = new MutationObserver(() => this.#readOptions());

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.value === '' && this.defaultValue !== '') this.value = this.defaultValue;
    this.#observer.observe(this, {subtree: true, childList: true, attributes: true});
    this.#readOptions();
  }

  override disconnectedCallback(): void {
    this.#observer.disconnect();
    super.disconnectedCallback();
  }

  protected override updated(_changed: PropertyValues): void {
    this.#internals.setFormValue(this.disabled || this.value === '' ? null : this.value);
    if (this.error) this.#internals.setValidity({customError: true}, this.error);
    else if (this.required && this.value === '') this.#internals.setValidity({valueMissing: true}, 'Choose an option.');
    else this.#internals.setValidity({});
  }

  render() {
    return html`
      <fieldset ?disabled=${this.disabled} aria-describedby=${this.error ? 'error' : ''}>
        <legend>${this.label}</legend>
        <div class="options">
          ${this.options.map((option) => html`
            <label>
              <input
                type="radio"
                name=${this.name}
                value=${option.value}
                .checked=${this.value === option.value}
                ?disabled=${option.disabled}
                @change=${() => this.#select(option.value)}
              />
              <span>${option.label}</span>
            </label>
          `)}
        </div>
        ${this.error ? html`<p id="error" class="error">${this.error}</p>` : null}
      </fieldset>
    `;
  }

  #readOptions(): void {
    this.options = [...this.querySelectorAll<ElnrChoice>(':scope > elnr-choice')].map((choice) => ({
      value: choice.getAttribute('value') ?? '',
      label: choice.getAttribute('label') ?? choice.textContent?.trim() ?? '',
      disabled: choice.hasAttribute('disabled'),
    }));
  }

  #select(value: string): void {
    this.value = value;
    this.dispatchEvent(valueEvent(value));
  }
}
