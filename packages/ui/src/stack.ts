import {css, html, LitElement} from 'lit';

export class ElnrStack extends LitElement {
  static properties = {
    direction: {type: String, reflect: true},
    gap: {type: String, reflect: true},
    align: {type: String, reflect: true},
    wrap: {type: String, reflect: true},
  };

  static styles = css`
    :host {
      display: block;
      min-inline-size: 0;
    }

    slot {
      align-items: var(--stack-align, stretch);
      display: flex;
      flex-direction: var(--stack-direction, column);
      flex-wrap: var(--stack-wrap, nowrap);
      gap: var(--stack-gap, var(--semantic-dimension-space-gap-medium));
      min-inline-size: 0;
    }

    :host([direction='row']) { --stack-direction: row; }
    :host([gap='xs']) { --stack-gap: var(--semantic-dimension-space-gap-x-small); }
    :host([gap='sm']) { --stack-gap: var(--semantic-dimension-space-gap-small); }
    :host([gap='md']) { --stack-gap: var(--semantic-dimension-space-gap-medium); }
    :host([gap='lg']) { --stack-gap: var(--semantic-dimension-space-gap-large); }
    :host([align='start']) { --stack-align: flex-start; }
    :host([align='center']) { --stack-align: center; }
    :host([align='end']) { --stack-align: flex-end; }
    :host([align='stretch']) { --stack-align: stretch; }
    :host([wrap='wrap']) { --stack-wrap: wrap; }
  `;

  direction: 'row' | 'column' = 'column';
  gap: 'xs' | 'sm' | 'md' | 'lg' = 'md';
  align: 'start' | 'center' | 'end' | 'stretch' = 'stretch';
  wrap: 'wrap' | 'nowrap' = 'nowrap';

  render() {
    return html`<slot></slot>`;
  }
}
