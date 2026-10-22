import {ImageGrid} from '@earendil-works/elanor-react';

import {PICTURES} from './pictures.ts';

export default function ImageGridDemo() {
  return <ImageGrid images={PICTURES.slice(0, 2)} />;
}
