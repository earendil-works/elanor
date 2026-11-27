import {Button as BaseButton} from '@base-ui/react/button';

import {mergeClassName} from '../utils/class-names.ts';

import styles from './icon-button.module.css';

export type IconButtonDensity = 'compact' | 'default';
export type IconButtonHierarchy = 'tertiary' | 'primary' | 'secondary';

export interface IconButtonProps extends BaseButton.Props {
  /** `compact`, the default, fits the fill to the icon; `default` is the medium size, as tall as a default Button. */
  readonly density?: IconButtonDensity;
  /** Visual emphasis. Use one `primary` button per view. */
  readonly hierarchy?: IconButtonHierarchy;
}

/**
 * A button that shows only an icon. Needs an `aria-label`. Renders `data-density` and
 * `data-hierarchy`, and `data-icon-button`, through which containers style it.
 */
export function IconButton({
  ref,
  density = 'compact',
  hierarchy = 'tertiary',
  disabled = false,
  type = 'button',
  className,
  ...props
}: IconButtonProps) {
  return (
    <BaseButton
      {...props}
      ref={ref}
      type={type}
      disabled={disabled}
      data-icon-button=""
      data-density={density}
      data-hierarchy={hierarchy}
      className={mergeClassName<BaseButton.State>(styles.root, className)}
    />
  );
}
