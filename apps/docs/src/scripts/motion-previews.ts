/*
 * Plays the motion token previews on the token pages. Each preview animates with its token's literal
 * duration, delay, and easing. Previews always play in full, also with reduced motion: they only run when
 * asked to, and showing the motion is their purpose.
 */

type Role = 'slide' | 'fade' | 'feedback' | 'pulse' | 'stale';

function keyframes(role: Role, target: HTMLElement, opacity: string): Keyframe[] {
  switch (role) {
    case 'slide': {
      const track = target.parentElement;
      const distance = track ? track.clientWidth - target.offsetWidth : 0;
      return [{transform: 'translateX(0)'}, {transform: `translateX(${distance}px)`}];
    }
    case 'feedback':
      return [
        {backgroundColor: 'var(--semantic-color-background-fill-secondary)'},
        {backgroundColor: 'var(--semantic-color-background-fill-primary)'},
      ];
    case 'pulse':
    case 'stale':
      return [{opacity: 1}, {opacity: Number(opacity)}];
    case 'fade':
      return [{opacity: 0}, {opacity: 1}];
  }
}

function play(preview: HTMLElement, button: HTMLElement): void {
  const target = preview.querySelector<HTMLElement>('[data-motion-target]');
  if (!target) return;
  const role = preview.dataset.motion as Role;
  for (const animation of target.getAnimations()) animation.cancel();
  target.animate(keyframes(role, target, preview.dataset.opacity ?? '1'), {
    duration: Number(preview.dataset.duration),
    delay: Number(preview.dataset.delay),
    easing: preview.dataset.easing ?? 'linear',
    // A pulse runs back and forth a few times, as in Skeleton.
    ...(role === 'pulse' ? {iterations: 4, direction: 'alternate'} : {fill: 'forwards'}),
  });
  if (!('played' in button.dataset)) {
    button.dataset.played = '';
    button.setAttribute('aria-label', 'Replay');
    button.title = 'Replay';
  }
}

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLElement>('[data-motion-play]');
  const preview = button?.closest<HTMLElement>('[data-motion]');
  if (button && preview) play(preview, button);
});
