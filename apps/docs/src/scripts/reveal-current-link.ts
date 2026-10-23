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

  const link = navigation.querySelector('a[aria-current="page"]');
  const sidebar = navigation.closest('aside');
  if (!link || !sidebar) return;
  // Scrolls the sidebar itself: `scrollIntoView` would also move where the next Tab starts.
  const linkRect = link.getBoundingClientRect();
  const sidebarRect = sidebar.getBoundingClientRect();
  const padding = parseFloat(getComputedStyle(sidebar).scrollPaddingBlockStart) || 0;
  if (linkRect.top < sidebarRect.top + padding) {
    sidebar.scrollTop -= sidebarRect.top + padding - linkRect.top;
  } else if (linkRect.bottom > sidebarRect.bottom - padding) {
    sidebar.scrollTop += linkRect.bottom - (sidebarRect.bottom - padding);
  }
}

document.addEventListener('astro:page-load', () => void revealCurrentLink());
