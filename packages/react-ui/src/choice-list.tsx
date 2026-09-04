'use client';

import {Field as BaseField} from '@base-ui/react/field';
import {Fieldset as BaseFieldset} from '@base-ui/react/fieldset';
import {Radio as BaseRadio} from '@base-ui/react/radio';
import {RadioGroup as BaseRadioGroup} from '@base-ui/react/radio-group';
import {forwardRef, type HTMLAttributes} from 'react';
import styles from './choice-list.module.css';
import {classes, mergeClassName} from './shared.js';

export const FieldsetRoot = forwardRef<HTMLElement, BaseFieldset.Root.Props>(function FieldsetRoot(
  {className, ...props},
  ref,
) {
  return (
    <BaseFieldset.Root
      {...props}
      ref={ref}
      className={mergeClassName<BaseFieldset.Root.State>(styles.fieldset, className)}
    />
  );
});

export const FieldsetLegend = forwardRef<HTMLDivElement, BaseFieldset.Legend.Props>(
  function FieldsetLegend({className, ...props}, ref) {
    return (
      <BaseFieldset.Legend
        {...props}
        ref={ref}
        className={mergeClassName<BaseFieldset.Legend.State>(styles.legend, className)}
      />
    );
  },
);

export const Fieldset = {
  Root: FieldsetRoot,
  Legend: FieldsetLegend,
} as const;

export function ChoiceListRoot<Value extends string = string>({
  className,
  ...props
}: BaseRadioGroup.Props<Value>): React.JSX.Element {
  return (
    <BaseRadioGroup<Value>
      {...props}
      className={mergeClassName<BaseRadioGroup.State>(styles.choiceList, className)}
    />
  );
}

export const ChoiceListOptions = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function ChoiceListOptions({className, ...props}, ref) {
    return <div {...props} ref={ref} className={classes(styles.options, className)} />;
  },
);

export const ChoiceList = {
  Root: ChoiceListRoot,
  Options: ChoiceListOptions,
} as const;

export const ChoiceItem = forwardRef<HTMLDivElement, BaseField.Item.Props>(function ChoiceItem(
  {className, ...props},
  ref,
) {
  return (
    <BaseField.Item
      {...props}
      ref={ref}
      className={mergeClassName<BaseField.Item.State>(styles.item, className)}
    />
  );
});

export const ChoiceLabel = forwardRef<HTMLElement, BaseField.Label.Props>(function ChoiceLabel(
  {className, ...props},
  ref,
) {
  return (
    <BaseField.Label
      {...props}
      ref={ref}
      className={mergeClassName<BaseField.Label.State>(styles.option, className)}
    />
  );
});

export const ChoiceDescription = forwardRef<HTMLParagraphElement, BaseField.Description.Props>(
  function ChoiceDescription({className, ...props}, ref) {
    return (
      <BaseField.Description
        {...props}
        ref={ref}
        className={mergeClassName<BaseField.Description.State>(styles.description, className)}
      />
    );
  },
);

export function ChoiceRoot<Value extends string = string>({
  className,
  ...props
}: BaseRadio.Root.Props<Value>): React.JSX.Element {
  return (
    <BaseRadio.Root<Value>
      {...props}
      className={mergeClassName<BaseRadio.Root.State>(styles.radio, className)}
    />
  );
}

export const ChoiceIndicator = forwardRef<HTMLSpanElement, BaseRadio.Indicator.Props>(
  function ChoiceIndicator({className, ...props}, ref) {
    return (
      <BaseRadio.Indicator
        {...props}
        ref={ref}
        className={mergeClassName<BaseRadio.Indicator.State>(styles.indicator, className)}
      />
    );
  },
);

export const Choice = {
  Item: ChoiceItem,
  Label: ChoiceLabel,
  Description: ChoiceDescription,
  Root: ChoiceRoot,
  Indicator: ChoiceIndicator,
} as const;
