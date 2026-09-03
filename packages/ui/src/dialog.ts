import {css, html, LitElement, type PropertyValues} from 'lit';
import {controlStyles} from './shared.js';

export type DialogCloseReason = 'escape' | 'dismiss' | 'programmatic';

export class ElnrDialog extends LitElement {
  static properties = {
    open: {type: Boolean, reflect: true},
    heading: {type: String},
  };

  static styles = [
    controlStyles,
    css`
      dialog {
        background: var(--semantic-color-background-surface);
        border: var(--semantic-dimension-border-width-small) solid var(--semantic-color-border-secondary);
        border-radius: var(--semantic-dimension-radius-large);
        color: var(--semantic-color-text-primary);
        inline-size: min(
          var(--semantic-dimension-breakpoint-small),
          calc(100vw - 2 * var(--semantic-dimension-space-padding-medium))
        );
        max-block-size: calc(100vh - 2 * var(--semantic-dimension-space-padding-medium));
        padding: var(--semantic-dimension-space-padding-large);
      }

      dialog::backdrop {
        background: var(--semantic-color-background-backdrop);
      }

      .frame {
        display: grid;
        gap: var(--semantic-dimension-space-gap-large);
      }

      h2 {
        color: var(--semantic-color-text-primary);
        font: var(--semantic-typography-heading-app-4);
        letter-spacing: var(--semantic-typography-heading-app-4-letter-spacing);
        margin: 0;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--semantic-dimension-space-control-gap-medium);
        justify-content: flex-end;
      }
    `,
  ];

  open = false;
  heading = '';
  #closeReason: DialogCloseReason = 'programmatic';

  protected override updated(changed: PropertyValues<this>): void {
    if (!changed.has('open')) return;
    const dialog = this.renderRoot.querySelector('dialog');
    if (!dialog) return;
    if (this.open && !dialog.open) dialog.showModal();
    if (!this.open && dialog.open) dialog.close();
  }

  render() {
    return html`
      <dialog @cancel=${this.#cancel} @close=${this.#closed} @click=${this.#backdropClick}>
        <div class="frame">
          <h2>${this.heading}</h2>
          <slot></slot>
          <div class="actions"><slot name="actions"></slot></div>
        </div>
      </dialog>
    `;
  }

  show(): void {
    this.open = true;
  }

  close(reason: DialogCloseReason = 'programmatic'): void {
    this.#closeReason = reason;
    this.open = false;
  }

  #cancel(): void {
    this.#closeReason = 'escape';
  }

  #backdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close('dismiss');
  }

  #closed(): void {
    this.open = false;
    this.dispatchEvent(new CustomEvent('elnr-close', {
      bubbles: true,
      composed: true,
      detail: {reason: this.#closeReason},
    }));
    this.#closeReason = 'programmatic';
  }
}
