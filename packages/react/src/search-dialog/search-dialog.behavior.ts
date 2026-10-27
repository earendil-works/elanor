import type {Behavior} from '../utils/enhance.ts';

export interface SearchDialogStaticResult {
  readonly url: string;
  readonly context: string;
  readonly title: string;
  readonly excerpt: string;
}

/** Where a static search dialog's results come from. */
export interface SearchDialogStaticSource {
  /** Loads what searching needs, when the dialog first opens; a rejection allows retrying. */
  load(): Promise<void>;
  /** The best matches first. Called only once `load` resolved. */
  search(query: string): readonly SearchDialogStaticResult[];
}

const maximumResults = 10;
const minimumQueryLength = 2;
const searchDelay = 150;

function partsOf(element: HTMLElement): {
  dialog: HTMLDialogElement;
  input: HTMLInputElement;
  list: HTMLElement;
  template: HTMLTemplateElement;
} {
  const input = element.querySelector('input[role="combobox"]');
  const list = element.querySelector('[role="listbox"]');
  const template = element.querySelector('template[data-elanor-search-template]');
  if (
    !(element instanceof HTMLDialogElement) ||
    !(input instanceof HTMLInputElement) ||
    !(list instanceof HTMLElement) ||
    !(template instanceof HTMLTemplateElement)
  ) {
    throw new Error('SearchDialog.StaticPopup needs a StaticInput and a StaticList.');
  }
  return {dialog: element, input, list, template};
}

/**
 * Searches in a server-rendered `SearchDialog.StaticPopup` without React: each opening starts with
 * an empty query; results come from `source` as the reader types, the first one selected; the
 * arrow keys move the selection, Enter follows it, and ⌘, Ctrl, or Alt with Enter opens it in a
 * new tab. Opening and closing come from `createModal`.
 */
export function createSearchDialog(
  element: HTMLElement,
  source: SearchDialogStaticSource,
): Behavior {
  const {dialog, input, list, template} = partsOf(element);
  const status = dialog.querySelector('[data-elanor-search-status]');
  const messages = [...dialog.querySelectorAll<HTMLElement>('[data-elanor-search-state]')];
  const queryOutputs = [...dialog.querySelectorAll('[data-elanor-search-query]')];
  let loading: Promise<void> | undefined;
  let loaded = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let options: HTMLElement[] = [];
  let selected = -1;
  let wasOpen = false;

  function load(): Promise<void> {
    loading ??= source.load().then(
      () => {
        loaded = true;
      },
      (error: unknown) => {
        loading = undefined;
        throw error;
      },
    );
    return loading;
  }

  function select(index: number): void {
    const previous = options[selected];
    previous?.setAttribute('aria-selected', 'false');
    previous?.removeAttribute('data-highlighted');
    selected = index;
    const option = options[selected];
    if (!option) {
      input.removeAttribute('aria-activedescendant');
      return;
    }
    option.setAttribute('aria-selected', 'true');
    option.setAttribute('data-highlighted', '');
    input.setAttribute('aria-activedescendant', option.id);
    option.scrollIntoView({block: 'nearest'});
  }

  function show(state: string, query = ''): void {
    for (const message of messages) message.hidden = message.dataset.elanorSearchState !== state;
    for (const output of queryOutputs) output.textContent = query;
    if (state !== 'results') {
      list.replaceChildren();
      options = [];
      select(-1);
    }
    input.setAttribute('aria-expanded', String(state === 'results'));
  }

  function announce(text: string): void {
    if (status && status.textContent !== text) status.textContent = text;
  }

  function render(results: readonly SearchDialogStaticResult[]): void {
    options = results.slice(0, maximumResults).flatMap((result, index) => {
      const option = template.content.firstElementChild?.cloneNode(true);
      if (!(option instanceof HTMLElement)) return [];
      option.id = `${list.id}-${index}`;
      option.setAttribute('href', result.url);
      for (const field of option.querySelectorAll<HTMLElement>('[data-elanor-search-field]')) {
        const name = field.dataset.elanorSearchField;
        if (name === 'context' || name === 'title' || name === 'excerpt') {
          field.textContent = result[name];
        }
      }
      return [option];
    });
    list.replaceChildren(...options);
    selected = -1;
  }

  function run(): void {
    clearTimeout(timer);
    timer = undefined;
    const query = input.value.trim();
    if (query.length === 0) {
      show('idle');
      announce('');
      return;
    }
    if (query.length < minimumQueryLength) {
      show('short');
      announce('');
      return;
    }
    if (!loaded) {
      show('loading');
      load().then(
        () => {
          if (input.value.trim() === query) run();
        },
        () => {
          if (input.value.trim() === query) show('error');
        },
      );
      return;
    }
    const results = source.search(query);
    if (results.length === 0) {
      show('empty', query);
      announce(`No results for “${query}”`);
      return;
    }
    render(results);
    show('results');
    select(0);
    announce(`${options.length} ${options.length === 1 ? 'result' : 'results'}`);
  }

  function onOpenChange(): void {
    const open = dialog.hasAttribute('open');
    if (open && !wasOpen) {
      input.value = '';
      run();
      load().catch(() => {});
      input.focus();
    }
    wasOpen = open;
  }

  function onInput(): void {
    clearTimeout(timer);
    if (input.value.trim().length === 0) run();
    else timer = setTimeout(run, searchDelay);
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (event.isComposing) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (options.length === 0) return;
      const step = event.key === 'ArrowDown' ? 1 : -1;
      select((selected + step + options.length) % options.length);
      return;
    }
    if (event.key !== 'Enter') return;
    if (timer !== undefined) run();
    const href = options[selected]?.getAttribute('href');
    if (!href) return;
    event.preventDefault();
    if (event.metaKey || event.ctrlKey || event.altKey) {
      window.open(href, '_blank', 'noopener,noreferrer');
      return;
    }
    options[selected]?.click();
  }

  function onPointerMove(event: PointerEvent): void {
    const option = event.target instanceof Element ? event.target.closest('[role="option"]') : null;
    const index = option instanceof HTMLElement ? options.indexOf(option) : -1;
    if (index !== -1 && index !== selected) select(index);
  }

  // A plain click follows the link and closes the dialog; a modified one opens it elsewhere.
  function onListClick(event: MouseEvent): void {
    const plain =
      event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
    if (plain && event.target instanceof Element && event.target.closest('[role="option"]')) {
      // Closes like Escape, so the modal behavior animates it.
      dialog.requestClose();
    }
  }

  const openObserver = new MutationObserver(onOpenChange);
  openObserver.observe(dialog, {attributes: true, attributeFilter: ['open']});
  input.addEventListener('input', onInput);
  input.addEventListener('keydown', onKeyDown);
  list.addEventListener('pointermove', onPointerMove);
  list.addEventListener('click', onListClick);
  onOpenChange();
  return {
    destroy() {
      clearTimeout(timer);
      openObserver.disconnect();
      input.removeEventListener('input', onInput);
      input.removeEventListener('keydown', onKeyDown);
      list.removeEventListener('pointermove', onPointerMove);
      list.removeEventListener('click', onListClick);
    },
  };
}
