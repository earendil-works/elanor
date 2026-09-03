import {copyFile, mkdir, rm} from 'node:fs/promises';
import {resolve} from 'node:path';

const source = resolve(process.cwd(), 'src', 'styles.css');
const output = resolve(process.cwd(), 'dist', 'styles.css');
await mkdir(resolve(process.cwd(), 'dist'), {recursive: true});
await copyFile(source, output);
console.log(`Copied ${source} to ${output}`);
