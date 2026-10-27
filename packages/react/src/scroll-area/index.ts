import {ScrollArea as BaseScrollArea} from '@base-ui/react/scroll-area';

export {
  ScrollAreaRoot as Root,
  ScrollAreaViewport as Viewport,
  ScrollAreaContent as Content,
  ScrollAreaScrollbar as Scrollbar,
  ScrollAreaThumb as Thumb,
} from './scroll-area.tsx';

export const Corner = BaseScrollArea.Corner;

export {
  ScrollAreaStaticRoot as StaticRoot,
  ScrollAreaStaticViewport as StaticViewport,
  ScrollAreaStaticContent as StaticContent,
  ScrollAreaStaticScrollbar as StaticScrollbar,
  ScrollAreaStaticThumb as StaticThumb,
} from './scroll-area-static.tsx';
