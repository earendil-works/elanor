import {forwardRef, type HTMLAttributes, type TableHTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes} from 'react';
import styles from './table.module.css';
import {classes} from '../utils/class-names.ts';

export interface TableContainerProps extends HTMLAttributes<HTMLDivElement> {}

export const TableContainer = forwardRef<HTMLDivElement, TableContainerProps>(
  function TableContainer({className, ...props}, ref) {
    return <div {...props} ref={ref} className={classes(styles.container, className)} />;
  },
);

export interface TableProps extends TableHTMLAttributes<HTMLTableElement> {}

export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  {className, ...props},
  ref,
) {
  return <table {...props} ref={ref} className={classes(styles.table, className)} />;
});

export interface TableHeadProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const TableHead = forwardRef<HTMLTableSectionElement, TableHeadProps>(
  function TableHead(props, ref) {
    return <thead {...props} ref={ref} />;
  },
);

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
  function TableBody(props, ref) {
    return <tbody {...props} ref={ref} />;
  },
);

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {}

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
  function TableRow({className, ...props}, ref) {
    return <tr data-outline="line" data-outline-edge="block-end" {...props} ref={ref} className={classes(styles.row, className)} />;
  },
);

export interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {}

export const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
  function TableHeaderCell({className, ...props}, ref) {
    return <th {...props} ref={ref} className={classes(styles.cell, styles.headerCell, className)} />;
  },
);

export interface TableCellProps extends Omit<TdHTMLAttributes<HTMLTableCellElement>, 'align'> {
  readonly align?: 'start' | 'center' | 'end';
}

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(function TableCell(
  {align = 'start', className, ...props},
  ref,
) {
  return (
    <td
      {...props}
      ref={ref}
      data-align={align}
      className={classes(styles.cell, className)}
    />
  );
});

export interface TableCellPrimaryProps extends HTMLAttributes<HTMLSpanElement> {}

export const TableCellPrimary = forwardRef<HTMLSpanElement, TableCellPrimaryProps>(
  function TableCellPrimary({className, ...props}, ref) {
    return <span {...props} ref={ref} className={classes(styles.primary, className)} />;
  },
);

export interface TableCellSecondaryProps extends HTMLAttributes<HTMLSpanElement> {}

export const TableCellSecondary = forwardRef<HTMLSpanElement, TableCellSecondaryProps>(
  function TableCellSecondary({className, ...props}, ref) {
    return <span {...props} ref={ref} className={classes(styles.secondary, className)} />;
  },
);
