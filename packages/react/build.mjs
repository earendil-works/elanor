import {execFileSync} from 'node:child_process';
import {cp, mkdir, readdir, rm} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {dirname, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const require = createRequire(import.meta.url);
const packageDirectory = dirname(fileURLToPath(import.meta.url));
const sourceDirectory = resolve(packageDirectory, 'src');
const outputDirectory = resolve(packageDirectory, 'dist');

await rm(outputDirectory, {recursive: true, force: true});
execFileSync(process.execPath, [require.resolve('typescript/bin/tsc'), '-p', 'tsconfig.json'], {
  cwd: packageDirectory,
  stdio: 'inherit',
});

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
