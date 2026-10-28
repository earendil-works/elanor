import type {Behavior} from '../utils/enhance.ts';

/**
 * Moves the page to a server-rendered `LinkedHeading`'s heading when its button copies the link,
 * as the React component does. The copying is `createCopyButton`'s.
 */
export function createLinkedHeading(root: HTMLElement): Behavior {
  const heading = root.querySelector('[id]');
  const button = root.querySelector('button');
  if (!heading || !button)
    throw new Error('LinkedHeading needs a heading with an id and a button.');
  const {id} = heading;

  function onClick(): void {
    location.hash = id;
  }

  button.addEventListener('click', onClick);
  return {
    destroy() {
      button.removeEventListener('click', onClick);
    },
  };
}
