import {ImageGrid} from '@earendil-works/elanor-react';

import {PICTURES} from './pictures.ts';

export default function ImageGridMore() {
  return <ImageGrid images={PICTURES.slice(0, 5)} />;
}
