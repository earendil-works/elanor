import {forwardRef, type HTMLAttributes} from 'react';
import styles from './partner-logos.module.css';
import {classes} from './shared.ts';

export interface PartnerLogosProps extends HTMLAttributes<HTMLUListElement> {}
export interface PartnerLogoProps extends HTMLAttributes<HTMLLIElement> {}

export const PartnerLogos = forwardRef<HTMLUListElement, PartnerLogosProps>(
  function PartnerLogos({className, ...props}, ref) {
    return <ul {...props} ref={ref} className={classes(styles.root, className)} />;
  },
);

export const PartnerLogo = forwardRef<HTMLLIElement, PartnerLogoProps>(
  function PartnerLogo({className, ...props}, ref) {
    return <li {...props} ref={ref} className={classes(styles.item, className)} />;
  },
);
