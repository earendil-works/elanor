import {css, html, LitElement} from 'lit';

export type BadgeTone = 'neutral' | 'information' | 'positive' | 'warning' | 'negative';

export class ElnrBadge extends LitElement {
  static properties = {
    tone: {type: String, reflect: true},
  };

  static styles = css`
    :host {
      --badge-background: var(--semantic-color-background-fill-secondary);
      --badge-color: var(--semantic-color-text-on-secondary-fill);
      background: var(--badge-background);
      border-radius: var(--semantic-dimension-radius-full);
      color: var(--badge-color);
      display: inline-flex;
      font: var(--semantic-typography-ui-secondary);
      inline-size: fit-content;
      padding-block: var(--semantic-dimension-space-control-padding-block-small);
      padding-inline: var(--semantic-dimension-space-control-padding-inline-small);
    }

    :host([tone='information']) {
      --badge-background: var(--semantic-color-background-fill-secondary-information);
      --badge-color: var(--semantic-color-text-on-secondary-fill-information);
    }

    :host([tone='positive']) {
      --badge-background: var(--semantic-color-background-fill-secondary-positive);
      --badge-color: var(--semantic-color-text-on-secondary-fill-positive);
    }

    :host([tone='warning']) {
      --badge-background: var(--semantic-color-background-fill-secondary-warning);
      --badge-color: var(--semantic-color-text-on-secondary-fill-warning);
    }

    :host([tone='negative']) {
      --badge-background: var(--semantic-color-background-fill-secondary-negative);
      --badge-color: var(--semantic-color-text-on-secondary-fill-negative);
    }
  `;

  tone: BadgeTone = 'neutral';

  render() {
    return html`<slot></slot>`;
  }
}
