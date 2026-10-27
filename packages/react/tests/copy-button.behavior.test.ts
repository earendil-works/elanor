// @vitest-environment happy-dom
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {createCopyButton, enhance} from '../src/behaviors.ts';
import {CopyButton} from '../src/copy-button/copy-button.tsx';

// Renders the React component on the "server" and binds the behavior, as a static page does.
function renderStatic(props: Parameters<typeof CopyButton>[0]): HTMLButtonElement {
  document.body.innerHTML = renderToStaticMarkup(createElement(CopyButton, props));
  enhance({'copy-button': createCopyButton});
  return document.querySelector('button')!;
}

const writeText = vi.fn<(text: string) => Promise<void>>();

beforeEach(() => {
  vi.useFakeTimers();
  writeText.mockReset().mockResolvedValue();
  Object.defineProperty(navigator, 'clipboard', {value: {writeText}, configurable: true});
});

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = '';
});

describe('copy button behavior', () => {
  it('copies the server-rendered value and reports it like the React component', async () => {
    const button = renderStatic({value: 'workspace-2048', copiedLabel: 'Copied the ID.'});
    const status = document.querySelector('[role="status"]')!;

    button.click();
    await vi.waitFor(() => expect(button.dataset.copyState).toBe('copied'));
    expect(writeText).toHaveBeenCalledWith('workspace-2048');
    expect(button.title).toBe('Copied the ID.');
    expect(status.textContent).toBe('Copied the ID.');

    vi.advanceTimersByTime(2000);
    expect(button.dataset.copyState).toBe('idle');
    expect(button.title).toBe('Copy');
    expect(status.textContent).toBe('');
  });

  it('reports a failed copy with the error label', async () => {
    writeText.mockRejectedValue(new Error('Denied'));
    const button = renderStatic({value: 'workspace-2048', errorLabel: 'Copy it by hand.'});

    button.click();
    await vi.waitFor(() => expect(button.dataset.copyState).toBe('error'));
    expect(button.title).toBe('Copy it by hand.');
  });

  it('renders no value for a function, which only runs with React', () => {
    const button = renderStatic({value: () => 'computed'});

    expect(button.hasAttribute('data-elanor-copy-value')).toBe(false);
    button.click();
    expect(writeText).not.toHaveBeenCalled();
  });

  it('attaches once when enhance runs again', async () => {
    const button = renderStatic({value: 'pi'});
    enhance({'copy-button': createCopyButton});

    button.click();
    await vi.waitFor(() => expect(button.dataset.copyState).toBe('copied'));
    expect(writeText).toHaveBeenCalledTimes(1);
  });
});
