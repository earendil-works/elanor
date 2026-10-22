import {Button, ImageViewer} from '@earendil-works/elanor-react';
import {useState} from 'react';

import {PICTURES} from './pictures.ts';

const IMAGES = PICTURES.slice(1, 2);

export default function ImageViewerSingle() {
  const [index, setIndex] = useState<number>();
  return (
    <>
      <Button onClick={() => setIndex(0)}>View the photo</Button>
      <ImageViewer images={IMAGES} index={index} onIndexChange={setIndex} />
    </>
  );
}
