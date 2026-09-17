import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import Ajv2020 from "ajv/dist/2020.js";

async function main(): Promise<void> {
const brand = process.argv[2];
if (!brand) throw new Error("Usage: tsx scripts/validate-catalogue.ts <brand>");

const outputDirectory = path.resolve("dist", brand);
const [schemaSource, catalogueSource, cssSource] = await Promise.all([
  readFile("schemas/catalogue.schema.json", "utf8"),
  readFile(path.join(outputDirectory, "tokens.catalog.json"), "utf8"),
  readFile(path.join(outputDirectory, "tokens.css"), "utf8"),
]);

const schema = JSON.parse(schemaSource) as object;
const catalogue = JSON.parse(catalogueSource) as {
  brand: string;
  tokens: Array<{ cssVariable: string }>;
};
const validate = new Ajv2020({ allErrors: true }).compile(schema);
if (!validate(catalogue)) {
  throw new Error(`Invalid ${brand} catalogue:\n${JSON.stringify(validate.errors, null, 2)}`);
}
if (catalogue.brand !== brand) throw new Error(`Expected brand ${brand}, received ${catalogue.brand}.`);

const unique = (values: string[]): Set<string> => {
  const result = new Set<string>();
  for (const value of values) {
    if (result.has(value)) throw new Error(`Duplicate generated name ${value}.`);
    result.add(value);
  }
  return result;
};

const cssVariables = new Set(
  [...cssSource.matchAll(/^\s*(--[A-Za-z0-9_-]+):/gm)].map((match) => match[1]),
);
const catalogueVariables = unique(catalogue.tokens.map((token) => token.cssVariable));
for (const name of cssVariables) {
  if (!catalogueVariables.has(name)) throw new Error(`${name} is emitted in CSS but absent from the catalogue.`);
}
for (const name of catalogueVariables) {
  if (!cssVariables.has(name)) throw new Error(`${name} is catalogued but absent from CSS.`);
}


console.log(`Validated ${brand} catalogue (${catalogueVariables.size} custom properties).`);
}

void main();
