import {
  createContext,
  useContext,
  useId,
  type ButtonHTMLAttributes,
  type DialogHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './modal.module.css';

interface StaticModalContextValue {
  readonly dialogId: string;
  readonly titleId: string;
  readonly descriptionId: string;
}

const StaticModalContext = /* @__PURE__ */ createContext<StaticModalContextValue | null>(null);

function useStaticModal(part: string): StaticModalContextValue {
  const modal = useContext(StaticModalContext);
  if (!modal) throw new Error(`Modal.${part} must be inside Modal.StaticRoot.`);
  return modal;
}

export interface ModalStaticRootProps {
  readonly children?: ReactNode;
}

/** A modal for pages without React in the browser; `createModal` makes it work. Renders no element. */
export function ModalStaticRoot({children}: ModalStaticRootProps) {
  const id = useId();
  return (
    <StaticModalContext.Provider
      value={{dialogId: `${id}-dialog`, titleId: `${id}-title`, descriptionId: `${id}-description`}}
    >
      {children}
    </StaticModalContext.Provider>
  );
}

export interface ModalStaticTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly ref?: Ref<HTMLButtonElement> | undefined;
}

export function ModalStaticTrigger({ref, ...props}: ModalStaticTriggerProps) {
  const {dialogId} = useStaticModal('StaticTrigger');
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      {...props}
      ref={ref}
      // Invoker commands open the dialog without JavaScript; React's types don't list them yet.
      {...{commandfor: dialogId, command: 'show-modal'}}
    />
  );
}

export interface ModalStaticPopupProps extends DialogHTMLAttributes<HTMLDialogElement> {
  readonly ref?: Ref<HTMLDialogElement> | undefined;
}

/** The dialog, centered over the page's backdrop. */
export function ModalStaticPopup({ref, className, ...props}: ModalStaticPopupProps) {
  const {dialogId, titleId, descriptionId} = useStaticModal('StaticPopup');
  return (
    <dialog
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      {...props}
      ref={ref}
      id={dialogId}
      data-elanor="modal"
      data-closed=""
      className={classes(styles.popup, className)}
    />
  );
}

export interface ModalStaticTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  readonly ref?: Ref<HTMLHeadingElement> | undefined;
}

export function ModalStaticTitle({ref, className, children, ...props}: ModalStaticTitleProps) {
  const {titleId} = useStaticModal('StaticTitle');
  return (
    <h2 {...props} ref={ref} id={titleId} className={classes(styles.title, className)}>
      {children}
    </h2>
  );
}

export interface ModalStaticDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  readonly ref?: Ref<HTMLParagraphElement> | undefined;
}

export function ModalStaticDescription({ref, className, ...props}: ModalStaticDescriptionProps) {
  const {descriptionId} = useStaticModal('StaticDescription');
  return (
    <p {...props} ref={ref} id={descriptionId} className={classes(styles.description, className)} />
  );
}

export interface ModalStaticCloseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly ref?: Ref<HTMLButtonElement> | undefined;
}

export function ModalStaticClose({ref, ...props}: ModalStaticCloseProps) {
  const {dialogId} = useStaticModal('StaticClose');
  return (
    <button type="button" {...props} ref={ref} {...{commandfor: dialogId, command: 'close'}} />
  );
}
