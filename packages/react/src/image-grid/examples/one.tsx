import {ImageGrid} from '@earendil-works/elanor-react';

import {PICTURES} from './pictures.ts';

export default function ImageGridOne() {
  return <ImageGrid images={PICTURES.slice(1, 2)} />;
}
