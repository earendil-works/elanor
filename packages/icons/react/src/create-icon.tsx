/*! @license Apache-2.0 */
import {forwardRef, type ForwardRefExoticComponent, type RefAttributes, type SVGProps} from 'react';

export interface IconProps extends SVGProps<SVGSVGElement> {
  /** Width and height, unless `width` or `height` is given. Defaults to 16. */
  size?: number | string;
}

export type IconComponent = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;

/** An icon is decorative (`aria-hidden`) unless it is named with `aria-label` or `aria-labelledby`. */
export function createIcon(displayName: string, viewBox: string, d: string): IconComponent {
  const Icon = forwardRef<SVGSVGElement, IconProps>(function ElanorIcon(
    {size = 16, children, ...props},
    ref,
  ) {
    const named = props['aria-label'] != null || props['aria-labelledby'] != null;
    return (
      <svg
        {...props}
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={props.width ?? size}
        height={props.height ?? size}
        viewBox={viewBox}
        fill="currentColor"
        role={props.role ?? (named ? 'img' : undefined)}
        aria-hidden={props['aria-hidden'] ?? (named ? undefined : true)}
        focusable={props.focusable ?? 'false'}
      >
        <path d={d} />
        {children}
      </svg>
    );
  });
  Icon.displayName = displayName;
  return Icon;
}
