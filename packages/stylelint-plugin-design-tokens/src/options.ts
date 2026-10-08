import path from 'node:path';

import {minimatch} from 'minimatch';
import type {Result} from 'postcss';

import type {LoadedCatalogue} from './catalogue.js';
import {loadCatalogue} from './catalogue.js';

export interface RuleOptions {
  catalogue: string;
  allowCustomProperties?: string[];
  ignoreFiles?: string[];
  foundationFiles?: string[];
  allowUnitlessZero?: boolean;
  propertyTypes?: Record<string, string[]>;
  semanticRoles?: Record<string, string[]>;
}

export const DEFAULT_IGNORES = [
  '**/dist/**',
  '**/vendor/**',
  '**/reset.css',
  '**/reset/**/*.css',
  '**/*.generated.css',
];

/**
 * Resolves and normalizes the source filename for a Stylelint result.
 *
 * @param result The PostCSS result being linted.
 * @returns The absolute, slash-normalized filename or `<input>`.
 */
function filenameFor(result: Result): string {
  return (result.opts.from ? path.resolve(result.opts.from) : '<input>').replaceAll('\\', '/');
}

/**
 * Checks whether a result's source filename matches any glob pattern.
 *
 * @param result The PostCSS result being linted.
 * @param patterns The glob patterns to test.
 * @returns Whether at least one pattern matches the source filename.
 */
export function matchesFile(result: Result, patterns: string[] = []): boolean {
  const filename = filenameFor(result);
  return patterns.some((pattern) => minimatch(filename, pattern, {dot: true, matchBase: true}));
}

/**
 * Checks whether a source file is excluded by a default or configured ignore.
 *
 * @param result The PostCSS result being linted.
 * @param options The rule options containing additional ignore patterns.
 * @returns Whether the source file should be ignored.
 */
export function isIgnored(result: Result, options: RuleOptions): boolean {
  return matchesFile(result, [...DEFAULT_IGNORES, ...(options.ignoreFiles ?? [])]);
}

/**
 * Checks whether a source file is allowed to define foundational token values.
 *
 * @param result The PostCSS result being linted.
 * @param options The rule options containing foundation file patterns.
 * @returns Whether the source file is a foundation file.
 */
export function isFoundation(result: Result, options: RuleOptions): boolean {
  return matchesFile(result, options.foundationFiles ?? []);
}

/**
 * Loads the token catalogue configured for a rule.
 *
 * @param options The rule options containing the catalogue path.
 * @returns The loaded and indexed token catalogue.
 * @throws When no catalogue path is configured or the catalogue is invalid.
 */
export function getCatalogue(options: RuleOptions): LoadedCatalogue {
  if (!options?.catalogue)
    throw new Error('A generated token catalogue path is required in the rule options.');
  return loadCatalogue(options.catalogue);
}

/**
 * Checks whether a custom property is permitted by an allow-list pattern.
 *
 * @param name The custom property name.
 * @param options The rule options containing allowed property patterns.
 * @returns Whether the custom property is allowed.
 */
export function isAllowedCustomProperty(name: string, options: RuleOptions): boolean {
  return (options.allowCustomProperties ?? []).some((pattern) => minimatch(name, pattern));
}
