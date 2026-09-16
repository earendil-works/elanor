import {Separator as BaseSeparator} from '@base-ui/react/separator';
import {forwardRef} from 'react';
import styles from './separator.module.css';
import {useBrushVariant, type BrushProps} from '../brush-border/use-brush-variant.ts';
import {mergeClassName} from '../utils/class-names.ts';

export type {SeparatorState} from '@base-ui/react/separator';

export interface SeparatorProps extends BaseSeparator.Props, BrushProps {}

export const Separator = forwardRef<HTMLDivElement, SeparatorProps>(function Separator(
  {className, brushVariant, ...props},
  ref,
) {
  return (
    <BaseSeparator
      data-brush-variant={useBrushVariant(brushVariant)}
      {...props}
      ref={ref}
      className={mergeClassName<BaseSeparator.State>(styles.root, className)}
    />
  );
});
