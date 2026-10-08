import {type Zippable, zipSync} from 'fflate';

const ICO_HEADER_SIZE = 6;
const ICO_ENTRY_SIZE = 16;

/**
 * An ICO file that embeds PNG images, as every current browser supports.
 *
 * Layout: a 6-byte header, then a 16-byte directory entry per image pointing
 * at its PNG data, then the PNGs themselves.
 */
export function createIco(images: Array<{size: number; png: Buffer}>): Buffer {
  const directory = Buffer.alloc(ICO_HEADER_SIZE + images.length * ICO_ENTRY_SIZE);
  directory.writeUInt16LE(0, 0); // reserved
  directory.writeUInt16LE(1, 2); // image type: icon
  directory.writeUInt16LE(images.length, 4); // image count

  let dataOffset = directory.length;
  images.forEach(({size, png}, index) => {
    const entry = ICO_HEADER_SIZE + index * ICO_ENTRY_SIZE;
    const dimension = size >= 256 ? 0 : size; // 0 means 256 pixels
    directory.writeUInt8(dimension, entry); // width
    directory.writeUInt8(dimension, entry + 1); // height
    directory.writeUInt8(0, entry + 2); // palette size: none
    directory.writeUInt8(0, entry + 3); // reserved
    directory.writeUInt16LE(1, entry + 4); // color planes
    directory.writeUInt16LE(32, entry + 6); // bits per pixel
    directory.writeUInt32LE(png.length, entry + 8); // image data size
    directory.writeUInt32LE(dataOffset, entry + 12); // image data offset
    dataOffset += png.length;
  });
  return Buffer.concat([directory, ...images.map(({png}) => png)]);
}

/** Every entry gets this date, so identical inputs produce identical archives. ZIP dates start in 1980. */
const ZIP_ENTRY_DATE = new Date(1980, 0, 1);

/** A ZIP archive. Already-compressed files (PNG, ZIP) are stored; others are deflated. */
export function createZip(files: Array<{path: string; data: Buffer}>): Buffer {
  const entries: Zippable = {};
  for (const {path, data} of files) {
    entries[path] = [data, {level: /\.(png|zip)$/i.test(path) ? 0 : 9, mtime: ZIP_ENTRY_DATE}];
  }
  return Buffer.from(zipSync(entries));
}
