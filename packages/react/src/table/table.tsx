import type {
  HTMLAttributes,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
  Ref,
} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './table.module.css';

export interface TableContainerProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

export function TableContainer({ref, className, ...props}: TableContainerProps) {
  return <div {...props} ref={ref} className={classes(styles.container, className)} />;
}

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {
  readonly ref?: Ref<HTMLTableElement> | undefined;
}

export function Table({ref, className, ...props}: TableProps) {
  return <table {...props} ref={ref} className={classes(styles.table, className)} />;
}

export interface TableHeadProps extends HTMLAttributes<HTMLTableSectionElement> {
  readonly ref?: Ref<HTMLTableSectionElement> | undefined;
}

export function TableHead({ref, ...props}: TableHeadProps) {
  return <thead {...props} ref={ref} />;
}

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
  readonly ref?: Ref<HTMLTableSectionElement> | undefined;
}

export function TableBody({ref, ...props}: TableBodyProps) {
  return <tbody {...props} ref={ref} />;
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  readonly ref?: Ref<HTMLTableRowElement> | undefined;
}

export function TableRow({ref, className, ...props}: TableRowProps) {
  return <tr {...props} ref={ref} className={classes(styles.row, className)} />;
}

export interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  readonly ref?: Ref<HTMLTableCellElement> | undefined;
}

export function TableHeaderCell({ref, className, ...props}: TableHeaderCellProps) {
  return <th {...props} ref={ref} className={classes(styles.cell, styles.headerCell, className)} />;
}

export interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  readonly ref?: Ref<HTMLTableCellElement> | undefined;
  readonly align?: 'start' | 'center' | 'end';
}

export function TableCell({ref, align = 'start', className, ...props}: TableCellProps) {
  return <td {...props} ref={ref} data-align={align} className={classes(styles.cell, className)} />;
}

export interface TableCellPrimaryProps extends HTMLAttributes<HTMLSpanElement> {
  readonly ref?: Ref<HTMLSpanElement> | undefined;
}

export function TableCellPrimary({ref, className, ...props}: TableCellPrimaryProps) {
  return <span {...props} ref={ref} className={classes(styles.primary, className)} />;
}

export interface TableCellSecondaryProps extends HTMLAttributes<HTMLSpanElement> {
  readonly ref?: Ref<HTMLSpanElement> | undefined;
}

export function TableCellSecondary({ref, className, ...props}: TableCellSecondaryProps) {
  return <span {...props} ref={ref} className={classes(styles.secondary, className)} />;
}
