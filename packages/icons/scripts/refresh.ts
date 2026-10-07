import {execFileSync} from "node:child_process";
import {cp, mkdtemp, mkdir, readFile, rename, rm, writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const provenancePath = resolve(packageDirectory, "provenance.json");
const provenance = JSON.parse(await readFile(provenancePath, "utf8")) as {
  repository: string;
  revision: string;
  [key: string]: unknown;
};
const revision = process.argv[2] ?? provenance.revision;
if (!/^[0-9a-f]{40}$/.test(revision)) {
  throw new Error("Pass a full 40-character upstream revision");
}

let repository = process.env.MATERIAL_ICONS_REPO;
let temporaryRepository: string | undefined;
const staging = resolve(packageDirectory, "sources.refreshing");
try {
  if (repository) {
    repository = resolve(process.env.INIT_CWD ?? process.cwd(), repository);
    const checkedOut = git(repository, ["rev-parse", "HEAD"]).trim();
    if (checkedOut !== revision) {
      throw new Error(`MATERIAL_ICONS_REPO is at ${checkedOut}, expected ${revision}`);
    }
  } else {
    temporaryRepository = await mkdtemp(resolve(tmpdir(), "elanor-material-icons-"));
    repository = temporaryRepository;
    git(repository, ["init", "--quiet"]);
    git(repository, ["remote", "add", "origin", provenance.repository]);
    git(repository, [
      "fetch",
      "--quiet",
      "--depth=1",
      "--filter=blob:none",
      "origin",
      revision,
    ]);
    const names = listIconNames(repository, "FETCH_HEAD");
    git(repository, ["sparse-checkout", "init", "--no-cone"]);
    await writeFile(
      resolve(repository, ".git/info/sparse-checkout"),
      [
        "/LICENSE",
        ...names.map((name) => `/symbols/web/${name}/materialsymbolsoutlined/${name}_20px.svg`),
      ].join("\n") + "\n",
    );
    git(repository, ["checkout", "--quiet", "--detach", "FETCH_HEAD"]);
  }

  const names = listIconNames(repository, revision);
  await rm(staging, {recursive: true, force: true});
  await mkdir(staging);
  for (const name of names) {
    const source = resolve(
      repository,
      "symbols/web",
      name,
      "materialsymbolsoutlined",
      `${name}_20px.svg`,
    );
    await cp(source, resolve(staging, `${name}.svg`));
  }
  await rm(resolve(packageDirectory, "sources"), {recursive: true, force: true});
  await rename(staging, resolve(packageDirectory, "sources"));
  await cp(resolve(repository, "LICENSE"), resolve(packageDirectory, "LICENSE"));
  if (revision !== provenance.revision) {
    provenance.revision = revision;
    await writeFile(provenancePath, `${JSON.stringify(provenance, null, 2)}\n`);
  }
  console.log(`Vendored ${names.length} icons from ${revision}.`);
  console.log("Review the upstream LICENSE/notices and this package's NOTICE before committing.");
} finally {
  await rm(staging, {recursive: true, force: true});
  if (temporaryRepository) await rm(temporaryRepository, {recursive: true, force: true});
}

function listIconNames(repositoryPath: string, treeish: string): string[] {
  const entries = git(repositoryPath, ["ls-tree", "--name-only", `${treeish}:symbols/web`])
    .split("\n")
    .filter(Boolean)
    .filter((name) => /^[a-z0-9_]+$/.test(name));
  return entries.sort();
}

function git(cwd: string, arguments_: string[]): string {
  return execFileSync("git", ["-C", cwd, ...arguments_], {encoding: "utf8", stdio: ["ignore", "pipe", "pipe"]});
}
