import {Image} from '@earendil-works/elanor-react';

// A 320 × 200 illustration, narrower than the demo, so it stays at its size and centers.
const illustration = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200">' +
    '<rect width="320" height="200" fill="#dfe7ec"/>' +
    '<circle cx="230" cy="64" r="28" fill="#f4c96b"/>' +
    '<path d="M0 160 L90 90 L160 150 L220 110 L320 170 V200 H0 Z" fill="#4f6a78"/>' +
    '</svg>',
)}`;

export default function ImageSmall() {
  return <Image src={illustration} width={320} height={200} alt="Mountains under a yellow sun" />;
}
