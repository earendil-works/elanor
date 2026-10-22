/** A landscape as an SVG data URL, at the given size and colors. */
function landscape(width: number, height: number, sky: string, sun: string, hills: string) {
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
      `<rect width="${width}" height="${height}" fill="${sky}"/>` +
      `<circle cx="${width * 0.72}" cy="${height * 0.3}" r="${Math.min(width, height) * 0.12}" fill="${sun}"/>` +
      `<path d="M0 ${height * 0.78} L${width * 0.3} ${height * 0.42} L${width * 0.55} ${height * 0.7} L${width * 0.8} ${height * 0.5} L${width} ${height * 0.8} V${height} H0 Z" fill="${hills}"/>` +
      '</svg>',
  )}`;
}

export const PICTURES = [
  {src: landscape(1600, 1000, '#dfe7ec', '#f4c96b', '#4f6a78'), alt: 'Hills under a yellow sun'},
  {
    src: landscape(900, 1600, '#f2ded9', '#e98a2e', '#7f5a6e'),
    alt: 'A tall view of a valley at dusk',
  },
  {
    src: landscape(1200, 1200, '#d9ece2', '#ffffff', '#378960'),
    alt: 'Green hills under a pale sun',
  },
  {src: landscape(1600, 900, '#e3e1ea', '#f79ba8', '#4a3973'), alt: 'Violet mountains at dawn'},
  {src: landscape(1000, 1400, '#edf2f2', '#e9c74c', '#27696e'), alt: 'A lake between teal hills'},
];
