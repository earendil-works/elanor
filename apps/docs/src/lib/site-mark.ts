import {getImage} from 'astro:assets';

import flowerSource from '../assets/home/elanor-flower.png';

/** The flower beside the wordmark, as a small responsive image. */
export interface SiteMark {
  readonly src: string;
  readonly srcSet: string;
  readonly width: number;
  readonly height: number;
}

export async function siteMark(): Promise<SiteMark> {
  const image = await getImage({
    src: flowerSource,
    width: 32,
    densities: [1, 2, 3],
    format: 'webp',
  });
  return {
    src: image.src,
    srcSet: image.srcSet.attribute,
    width: Number(image.attributes.width),
    height: Number(image.attributes.height),
  };
}
