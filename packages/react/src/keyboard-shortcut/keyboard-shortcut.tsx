import type {HTMLAttributes, Ref} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './keyboard-shortcut.module.css';

export interface KeyboardShortcutProps extends HTMLAttributes<HTMLElement> {
  readonly ref?: Ref<HTMLElement> | undefined;
}

/**
 * A key combination. Put `KeyboardKey`s inside, with the separator as text, such as
 * `<KeyboardKey>Ctrl</KeyboardKey>+<KeyboardKey>C</KeyboardKey>`.
 */
export function KeyboardShortcut({ref, className, ...props}: KeyboardShortcutProps) {
  return <kbd {...props} ref={ref} className={classes(styles.shortcut, className)} />;
}

export interface KeyboardKeyProps extends HTMLAttributes<HTMLElement> {
  readonly ref?: Ref<HTMLElement> | undefined;
}

/** A single key, on its own or inside a `KeyboardShortcut`. */
export function KeyboardKey({ref, className, ...props}: KeyboardKeyProps) {
  return <kbd {...props} ref={ref} className={classes(styles.key, className)} />;
}
