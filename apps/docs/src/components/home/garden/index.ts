import {bringFlowerToLife} from './flower.ts';
import {playIntro} from './intro.ts';
import {connectPapers} from './tethers.ts';

/** Starts the garden rendered by `home-garden.astro`. */
export function plantGarden(): void {
  const garden = document.querySelector<HTMLElement>('.garden');
  const art = garden?.querySelector<HTMLElement>('.flower-art');
  const reference = garden?.querySelector<HTMLImageElement>('.flower-reference');
  const canvas = garden?.querySelector<HTMLCanvasElement>('.pollen-canvas');
  if (!garden || !art || !reference || !canvas) return;
  const couriers = [...garden.querySelectorAll<HTMLAnchorElement>('.courier')];

  connectPapers(garden, couriers);
  playIntro({reference, damp: garden.querySelector('.flower-damp'), couriers});
  // Hovering a petal highlights its courier; clicking follows its link.
  bringFlowerToLife({
    garden,
    art,
    reference,
    canvas,
    onHover: (petal) =>
      couriers.forEach((courier, index) => courier.classList.toggle('active', index === petal)),
    onSelect: (petal) => couriers[petal]?.click(),
  }).catch((error: unknown) => console.warn('Elanor: flower is static.', error));

  // A reload plays the intro.
  const replay = document.querySelector<HTMLButtonElement>('[data-replay-intro]');
  if (replay) {
    replay.hidden = false;
    replay.addEventListener('click', () => window.location.reload());
  }
}
