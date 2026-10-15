/** A Shiki theme whose colors are the code syntax tokens, as CSS variables. */
declare const theme: {
  name: 'elanor';
  type: 'light';
  fg: string;
  bg: string;
  tokenColors: {scope?: string[]; settings: {foreground: string}}[];
};
export default theme;
