import {Image} from '@earendil-works/elanor-react';

// A 1600 × 800 illustration, wider than the demo, so it scales down.
const illustration = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="800" viewBox="0 0 1600 800">' +
    '<rect width="1600" height="800" fill="#dfe7ec"/>' +
    '<circle cx="1220" cy="230" r="110" fill="#f4c96b"/>' +
    '<path d="M0 620 L420 300 L760 560 L1080 360 L1600 700 V800 H0 Z" fill="#7f9aa8"/>' +
    '<path d="M0 700 L520 480 L940 690 L1300 560 L1600 640 V800 H0 Z" fill="#4f6a78"/>' +
    '</svg>',
)}`;

export default function ImageDemo() {
  return <Image src={illustration} width={1600} height={800} alt="Mountains under a yellow sun" />;
}
