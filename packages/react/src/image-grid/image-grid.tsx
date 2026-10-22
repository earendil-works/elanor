import {useState, type HTMLAttributes, type Ref} from 'react';

import {ImageViewer, type ImageViewerImage} from '../image-viewer/image-viewer.tsx';
import {classes} from '../utils/class-names.ts';

import styles from './image-grid.module.css';

export interface ImageGridProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
  /** The images, in order. Each opens full screen in an image viewer. */
  readonly images: readonly ImageViewerImage[];
  /** How many thumbnails show; the last shown carries a count of the rest. */
  readonly max?: number | undefined;
}

/**
 * Pictures as thumbnails at one width, so grids line up: one image at its own shape, two or more as squares, three
 * with the first one large. A tap opens an image full screen in an image viewer, where the reader steps through all
 * of them.
 */
export function ImageGrid({ref, images, max = 4, className, ...props}: ImageGridProps) {
  const [open, setOpen] = useState<number>();
  const shown = images.slice(0, Math.max(1, max));
  const more = images.length - shown.length;
  return (
    <>
      <div
        {...props}
        ref={ref}
        className={classes(styles.root, className)}
        data-count={shown.length}
      >
        {shown.map((image, index) => (
          <button
            // An image's place in the list is its identity: the list does not reorder.
            key={index}
            type="button"
            className={styles.item}
            aria-label={
              image.alt ? `Open ${image.alt}` : `Open image ${index + 1} of ${images.length}`
            }
            onClick={() => setOpen(index)}
          >
            <img className={styles.image} src={image.src} alt="" decoding="async" />
            {more > 0 && index === shown.length - 1 && (
              <span className={styles.more} aria-hidden="true">
                +{more}
              </span>
            )}
          </button>
        ))}
      </div>
      <ImageViewer images={images} index={open} onIndexChange={setOpen} />
    </>
  );
}
