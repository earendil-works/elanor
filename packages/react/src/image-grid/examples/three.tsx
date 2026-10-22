import {ImageGrid} from '@earendil-works/elanor-react';

import {PICTURES} from './pictures.ts';

export default function ImageGridThree() {
  return <ImageGrid images={PICTURES.slice(0, 3)} />;
}
