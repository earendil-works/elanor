import {forwardRef, type HTMLAttributes, type TableHTMLAttributes, type TdHTMLAttributes, type ThHTMLAttributes} from 'react';
import styles from './table.module.css';
import {classes} from '../utils/class-names.ts';

export const TableContainer = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
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

export const TableHead = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableHead(props, ref) {
    return <thead {...props} ref={ref} />;
  },
);

export const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  function TableBody(props, ref) {
    return <tbody {...props} ref={ref} />;
  },
);

export const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  function TableRow({className, ...props}, ref) {
    return <tr {...props} ref={ref} className={classes(styles.row, className)} />;
  },
);

export const TableHeaderCell = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
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

export const TableCellPrimary = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function TableCellPrimary({className, ...props}, ref) {
    return <span {...props} ref={ref} className={classes(styles.primary, className)} />;
  },
);

export const TableCellSecondary = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  function TableCellSecondary({className, ...props}, ref) {
    return <span {...props} ref={ref} className={classes(styles.secondary, className)} />;
  },
);
