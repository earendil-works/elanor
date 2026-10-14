import {SegmentedControl, SegmentedControlItem} from '@earendil-works/elanor-react';
import {useEffect, useState} from 'react';

export const STROKE_STORAGE_KEY = 'elanor-docs-strokes';

type StrokeStyle = 'plain' | 'pencil';

/** Switches every component preview between plain and pencil strokes. */
export function StrokeStyleToggle(): React.JSX.Element {
  const [style, setStyle] = useState<StrokeStyle>('plain');

  useEffect(() => {
    setStyle(localStorage.getItem(STROKE_STORAGE_KEY) === 'pencil' ? 'pencil' : 'plain');
  }, []);

  function choose(next: StrokeStyle): void {
    setStyle(next);
    localStorage.setItem(STROKE_STORAGE_KEY, next);
    if (next === 'pencil') document.documentElement.dataset.strokes = 'pencil';
    else delete document.documentElement.dataset.strokes;
  }

  return (
    <SegmentedControl aria-label="Stroke style" value={[style]} onValueChange={(value) => value[0] && choose(value[0] as StrokeStyle)}>
      <SegmentedControlItem value="plain">Plain</SegmentedControlItem>
      <SegmentedControlItem value="pencil">Pencil</SegmentedControlItem>
    </SegmentedControl>
  );
}
