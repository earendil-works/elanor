import {cp, mkdir, readdir} from 'node:fs/promises';
import {dirname, relative, resolve} from 'node:path';

const sourceDirectory = resolve(process.cwd(), 'src');
const outputDirectory = resolve(process.cwd(), 'dist');

for await (const source of cssFiles(sourceDirectory)) {
  const output = resolve(outputDirectory, relative(sourceDirectory, source));
  await mkdir(dirname(output), {recursive: true});
  await cp(source, output);
}

async function* cssFiles(directory) {
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) yield* cssFiles(path);
    else if (entry.isFile() && entry.name.endsWith('.css')) yield path;
  }
}
