const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

/** Scrolls the desktop navigation so the current page's link is visible. */
async function revealCurrentLink(): Promise<void> {
  const navigation = document.querySelector('[data-docs-swap="navigation"]');
  // Hidden on narrow screens.
  if (!navigation?.getClientRects().length) return;

  // After client-side navigation, the persisted sidebar re-renders and may open a section.
  await nextFrame();
  await nextFrame();
  await Promise.allSettled(
    navigation.getAnimations({subtree: true}).map((animation) => animation.finished),
  );

  navigation.querySelector('a[aria-current="page"]')?.scrollIntoView({block: 'nearest'});
}

document.addEventListener('astro:page-load', () => void revealCurrentLink());
