import type {Behavior} from '../utils/enhance.ts';

const focusable =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

/**
 * Runs a server-rendered `TopNavigation.StaticMenu` without React, like the React menu: the
 * trigger opens and closes it, Escape and choosing a link close it, and presses outside leave it
 * open; panels slide to nested ones and back, moving focus to the back button and then to the item
 * that opened the panel; each opening starts at the default panel. Without the behavior, it is a
 * native `popover="auto"` the trigger toggles.
 */
export function createTopNavigationMenu(popup: HTMLElement): Behavior {
  const ownerDocument = popup.ownerDocument;
  const triggers = [
    ...ownerDocument.querySelectorAll<HTMLButtonElement>(`[popovertarget="${popup.id}"]`),
  ];
  const panels = [...popup.querySelectorAll<HTMLElement>('[data-elanor-panel]')];
  const defaultPanel = popup.dataset.elanorDefaultPanel ?? '';
  let opener: HTMLElement | null = null;

  // The behavior closes it on Escape and keeps it open on presses outside, like the React menu.
  popup.popover = 'manual';

  function panelNamed(name: string): HTMLElement | undefined {
    return panels.find((panel) => panel.dataset.elanorPanel === name);
  }

  function show(name: string): HTMLElement | undefined {
    for (const panel of panels) {
      const current = panel.dataset.elanorPanel === name;
      panel.dataset.position = current
        ? 'current'
        : panel.dataset.elanorParent
          ? 'after'
          : 'before';
      panel.inert = !current;
    }
    return panelNamed(name);
  }

  function setOpenState(open: boolean): void {
    for (const trigger of triggers) {
      trigger.setAttribute('aria-expanded', String(open));
      trigger.toggleAttribute('data-popup-open', open);
    }
  }

  function open(): void {
    opener = null;
    show(defaultPanel);
    popup.showPopover();
    setOpenState(true);
    panelNamed(defaultPanel)?.querySelector<HTMLElement>(focusable)?.focus({preventScroll: true});
    ownerDocument.addEventListener('keydown', onKeyDown);
  }

  function close(returnFocus: boolean): void {
    popup.hidePopover();
    setOpenState(false);
    ownerDocument.removeEventListener('keydown', onKeyDown);
    if (returnFocus) triggers[0]?.focus();
  }

  function onTriggerClick(event: MouseEvent): void {
    // The behavior opens and closes instead of the browser, to keep the menu's states.
    event.preventDefault();
    if (popup.matches(':popover-open')) close(false);
    else open();
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    event.preventDefault();
    close(true);
  }

  function onPopupClick(event: MouseEvent): void {
    if (!(event.target instanceof Element)) return;
    const panelTrigger = event.target.closest<HTMLElement>('[data-elanor-panel-trigger]');
    if (panelTrigger) {
      opener = panelTrigger;
      show(panelTrigger.dataset.elanorPanelTrigger ?? '')
        ?.querySelector<HTMLElement>('[data-elanor-back]')
        ?.focus({preventScroll: true});
      return;
    }
    const leaving = event.target
      .closest('[data-elanor-back]')
      ?.closest<HTMLElement>('[data-elanor-panel]');
    const parent = leaving?.dataset.elanorParent;
    if (leaving && parent) {
      // Without an opener, the menu opened on this panel: focus the item that leads to it.
      const item =
        opener ??
        show(parent)?.querySelector<HTMLElement>(
          `[data-elanor-panel-trigger="${leaving.dataset.elanorPanel}"]`,
        );
      show(parent);
      item?.focus({preventScroll: true});
      return;
    }
    const plain =
      event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
    if (plain && event.target.closest('a[href]')) close(false);
  }

  for (const trigger of triggers) trigger.addEventListener('click', onTriggerClick);
  popup.addEventListener('click', onPopupClick);
  return {
    destroy() {
      for (const trigger of triggers) trigger.removeEventListener('click', onTriggerClick);
      popup.removeEventListener('click', onPopupClick);
      ownerDocument.removeEventListener('keydown', onKeyDown);
      popup.popover = 'auto';
    },
  };
}
