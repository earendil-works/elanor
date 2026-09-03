import {css, html, LitElement} from 'lit';

export class ElnrText extends LitElement {
  static properties = {
    tone: {type: String, reflect: true},
    variant: {type: String, reflect: true},
    live: {type: String, reflect: true},
  };

  static styles = css`
    :host {
      color: var(--text-color, var(--semantic-color-text-primary));
      display: block;
      font: var(--semantic-typography-ui-primary);
      min-inline-size: 0;
    }

    :host([tone='secondary']) { --text-color: var(--semantic-color-text-secondary); }
    :host([tone='positive']) { --text-color: var(--semantic-color-text-positive); }
    :host([tone='negative']) { --text-color: var(--semantic-color-text-negative); }
    :host([variant='small']) { font: var(--semantic-typography-ui-secondary); }
    :host([variant='code']) {
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      white-space: pre-wrap;
    }
  `;

  tone: 'primary' | 'secondary' | 'positive' | 'negative' = 'primary';
  variant: 'body' | 'small' | 'code' = 'body';
  live: 'off' | 'polite' | 'assertive' = 'off';

  render() { return html`<span aria-live=${this.live}><slot></slot></span>`; }
}

export class ElnrHeading extends LitElement {
  static properties = {level: {type: Number, reflect: true}};
  static styles = css`
    :host {
      color: var(--semantic-color-text-primary);
      display: block;
      font: var(--semantic-typography-heading-app-4);
      letter-spacing: var(--semantic-typography-heading-app-4-letter-spacing);
    }
    :host([level='3']), :host([level='4']), :host([level='5']), :host([level='6']) {
      font: var(--semantic-typography-heading-app-6);
      letter-spacing: var(--semantic-typography-heading-app-6-letter-spacing);
    }
  `;

  level = 2;

  protected override updated(): void {
    this.setAttribute('role', 'heading');
    this.setAttribute('aria-level', String(Math.min(6, Math.max(1, this.level))));
  }

  render() { return html`<slot></slot>`; }
}

export class ElnrBox extends LitElement {
  static properties = {
    padding: {type: String, reflect: true},
    surface: {type: String, reflect: true},
    border: {type: Boolean, reflect: true},
  };
  static styles = css`
    :host {
      background: var(--box-background, transparent);
      border: var(--box-border, 0);
      border-radius: var(--semantic-dimension-radius-default);
      display: block;
      min-inline-size: 0;
      padding: var(--box-padding, 0);
    }
    :host([padding='sm']) { --box-padding: var(--semantic-dimension-space-padding-small); }
    :host([padding='md']) { --box-padding: var(--semantic-dimension-space-padding-medium); }
    :host([padding='lg']) { --box-padding: var(--semantic-dimension-space-padding-large); }
    :host([surface='subdued']) { --box-background: var(--semantic-color-background-fill-secondary); }
    :host([surface='primary']) { --box-background: var(--semantic-color-background-surface); }
    :host([border]) { --box-border: var(--semantic-dimension-border-width-small) solid var(--semantic-color-border-secondary); }
  `;

  padding: 'none' | 'sm' | 'md' | 'lg' = 'none';
  surface: 'transparent' | 'primary' | 'subdued' = 'transparent';
  border = false;

  render() { return html`<slot></slot>`; }
}
