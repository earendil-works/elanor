import { swapFunctions } from 'astro:transitions/client';

const regions = ['navigation', 'content'] as const;

document.addEventListener('astro:before-swap', (event) => {
  event.swap = () => {
    const nextDocument = event.newDocument;

    swapFunctions.deselectScripts(nextDocument);
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
    document.querySelector('.astro-route-announcer')?.remove();
  };
});
