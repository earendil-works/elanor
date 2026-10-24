/** Dispatched on the garden when the visitor pauses or resumes it. */
export const PAUSE_EVENT = 'garden-pause';

export const isPaused = (garden: HTMLElement): boolean => 'paused' in garden.dataset;

/** The header's pause toggle. `data-paused` stops the CSS animations; script animations stop here. */
export function connectPauseToggle(garden: HTMLElement): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-garden-pause]');
  if (!toggle) return;
  let held: Animation[] = [];
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    const paused = !isPaused(garden);
    garden.toggleAttribute('data-paused', paused);
    toggle.setAttribute('aria-pressed', String(paused));
    if (paused) {
      held = garden
        .getAnimations({subtree: true})
        .filter(
          (animation) =>
            !(animation instanceof CSSAnimation || animation instanceof CSSTransition) &&
            animation.playState === 'running',
        );
      for (const animation of held) animation.pause();
    } else {
      for (const animation of held) animation.play();
      held = [];
    }
    garden.dispatchEvent(new Event(PAUSE_EVENT));
  });
}
