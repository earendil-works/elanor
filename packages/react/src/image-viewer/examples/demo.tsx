import {Button, ImageViewer} from '@earendil-works/elanor-react';
import {useState} from 'react';

import {PICTURES} from './pictures.ts';

export default function ImageViewerDemo() {
  const [index, setIndex] = useState<number>();
  return (
    <>
      <Button onClick={() => setIndex(0)}>View the photos</Button>
      <ImageViewer images={PICTURES} index={index} onIndexChange={setIndex} />
    </>
  );
}
