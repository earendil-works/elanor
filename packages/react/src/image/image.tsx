import type {ImgHTMLAttributes, Ref} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './image.module.css';

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  readonly ref?: Ref<HTMLImageElement> | undefined;
  /** Describe the image, or pass an empty string when it is decorative. */
  readonly alt: string;
}

/**
 * A centered image that scales down to fit its container and keeps its aspect ratio. It decodes
 * off the main thread unless `decoding` says otherwise.
 */
export function Image({ref, alt, className, decoding = 'async', ...props}: ImageProps) {
  return (
    <img
      {...props}
      ref={ref}
      alt={alt}
      decoding={decoding}
      className={classes(styles.root, className)}
    />
  );
}
