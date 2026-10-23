/*
 * Plays the motion token previews on the token pages. Each preview animates with its token's literal
 * duration, delay, and easing. Previews always play in full, also with reduced motion: they only run when
 * asked to, and showing the motion is their purpose.
 */

type Role = 'slide' | 'fade' | 'feedback' | 'pulse' | 'stale';
/** Travel and scale values: the sample moves from where it starts to rest; a key presses down. */
type ValueRole = 'travel' | 'scale' | 'press';

const valueRoles: ReadonlySet<string> = new Set<ValueRole>(['travel', 'scale', 'press']);

function valueKeyframes(role: ValueRole, from: string): Keyframe[] {
  switch (role) {
    case 'travel':
      return [{translate: from}, {translate: '0 0'}];
    case 'scale':
      return [{scale: from}, {scale: 1}];
    case 'press': {
      // Up at rest, then pressed in by the travel and the thicker bottom edge, as in KeyboardShortcut.
      const rest = {
        translate: '0 0',
        borderBlockEndWidth: 'var(--semantic-dimension-border-width-medium)',
      };
      const pressed = {
        translate: from,
        borderBlockEndWidth: 'var(--semantic-dimension-border-width-small)',
      };
      return [
        {...rest, offset: 0},
        {...rest, offset: 0.4},
        {...pressed, offset: 0.4},
        {...pressed, offset: 1},
      ];
    }
  }
}

function playValue(preview: HTMLElement, target: HTMLElement, role: ValueRole): void {
  const {
    from = '0',
    duration,
    delay,
    easing = 'linear',
    fadeDuration,
    fadeEasing,
  } = preview.dataset;
  target.animate(valueKeyframes(role, from), {
    duration: Number(duration),
    delay: Number(delay),
    easing,
    fill: 'forwards',
  });
  // Popups also fade in.
  if (fadeDuration)
    target.animate([{opacity: 0}, {opacity: 1}], {
      duration: Number(fadeDuration),
      delay: Number(delay),
      easing: fadeEasing ?? 'linear',
      fill: 'forwards',
    });
}

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
  for (const animation of target.getAnimations()) animation.cancel();
  const role = preview.dataset.motion ?? '';
  if (valueRoles.has(role)) playValue(preview, target, role as ValueRole);
  else playRole(preview, target, role as Role);
  if (!('played' in button.dataset)) {
    button.dataset.played = '';
    button.setAttribute('aria-label', 'Replay');
    button.title = 'Replay';
  }
}

function playRole(preview: HTMLElement, target: HTMLElement, role: Role): void {
  target.animate(keyframes(role, target, preview.dataset.opacity ?? '1'), {
    duration: Number(preview.dataset.duration),
    delay: Number(preview.dataset.delay),
    easing: preview.dataset.easing ?? 'linear',
    // A pulse runs back and forth a few times, as in Skeleton.
    ...(role === 'pulse' ? {iterations: 4, direction: 'alternate'} : {fill: 'forwards'}),
  });
}

document.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLElement>('[data-motion-play]');
  const preview = button?.closest<HTMLElement>('[data-motion]');
  if (button && preview) play(preview, button);
});
