const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

/** Scrolls the desktop sidebar to the current page's link. */
async function revealCurrentLink(): Promise<void> {
  const navigation = document.querySelector('[data-docs-swap="navigation"]');
  // Hidden on narrow screens.
  if (!navigation?.getClientRects().length) return;

  // Wait for the persisted sidebar to re-render and open the current section.
  await nextFrame();
  await nextFrame();
  await Promise.allSettled(
    navigation.getAnimations({subtree: true}).map((animation) => animation.finished),
  );

  navigation.querySelector('a[aria-current="page"]')?.scrollIntoView({block: 'nearest'});
}

document.addEventListener('astro:page-load', () => void revealCurrentLink());
