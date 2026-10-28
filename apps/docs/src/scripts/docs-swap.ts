import {swapFunctions} from 'astro:transitions/client';

const regions = ['header', 'navigation', 'content', 'search'] as const;

document.addEventListener('astro:before-swap', (event) => {
  event.swap = () => {
    const nextDocument = event.newDocument;

    swapFunctions.deselectScripts(nextDocument);
    // The color scheme is set on the client; keep it when root attributes are swapped.
    const colorScheme = document.documentElement.dataset.colorScheme;
    if (colorScheme) nextDocument.documentElement.dataset.colorScheme = colorScheme;
    swapFunctions.swapRootAttributes(nextDocument);
    swapFunctions.swapHeadElements(nextDocument);

    const restoreFocus = swapFunctions.saveFocus();

    for (const region of regions) {
      const selector = `[data-docs-swap="${region}"]`;
      const currentElement = document.querySelector(selector);
      const nextElement = nextDocument.querySelector(selector);

      if (currentElement && nextElement) {
        swapFunctions.swapBodyElement(nextElement, currentElement);
      }
    }

    restoreFocus();

    // Page scripts sit outside the swapped regions. Add new ones; Astro runs them after the swap.
    for (const script of nextDocument.body.querySelectorAll<HTMLScriptElement>(':scope > script')) {
      if (!('astroExec' in script.dataset)) document.body.append(script);
    }

    document.querySelector('.astro-route-announcer')?.remove();
  };
});
