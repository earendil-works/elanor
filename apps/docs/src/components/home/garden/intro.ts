import {currentColorScheme} from '../../../scripts/color-scheme.ts';
import {launchCouriers} from './arrival.ts';
import {paintBloom} from './bloom.ts';

declare global {
  interface Window {
    /** Safety timeout set by the inline intro script in `home-garden.astro`. */
    elanorIntro?: number;
  }
}

const TIMING = {
  light: {bloom: 1900, couriersDelay: 600, flight: 1650},
  dark: {bloom: 2300, couriersDelay: 750, flight: 2000},
} as const;

const root = document.documentElement;
const end = () => root.classList.remove('intro', 'intro-settling');

interface IntroElements {
  readonly reference: HTMLImageElement;
  readonly damp: HTMLElement | null;
  readonly couriers: readonly HTMLElement[];
}

async function play({reference, damp, couriers}: IntroElements): Promise<void> {
  try {
    await reference.decode();
  } catch {
    // Play on without the painting.
  }
  // The safety timeout already ended the intro.
  if (!root.classList.contains('intro')) return;
  clearTimeout(window.elanorIntro);

  if (damp) {
    const {opacity} = getComputedStyle(damp);
    for (const animation of damp.getAnimations()) animation.cancel();
    damp
      .animate([{opacity}, {opacity: 0}], {duration: 700, easing: 'ease-out', fill: 'forwards'})
      .finished.then(
        () => damp.remove(),
        () => {},
      );
  }

  const timing = TIMING[currentColorScheme()];
  const flights = launchCouriers(couriers, timing.couriersDelay, timing.flight);
  // The halo, center light, and pollen fade in while the petal tips finish.
  await paintBloom(reference, timing.bloom, {
    onSettling: () => root.classList.add('intro-settling'),
  }).catch((error: unknown) => console.warn('Elanor: skipped bloom.', error));
  end();
  await flights;
}

/** Plays the intro if the head script set `.intro`. */
export function playIntro(elements: IntroElements): void {
  if (!root.classList.contains('intro')) return;
  play(elements).catch(end);
}
