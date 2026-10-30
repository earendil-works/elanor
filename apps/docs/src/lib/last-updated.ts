import {execFileSync} from 'node:child_process';

/*
 * When a docs page last changed: the date of the last commit that touched its sources. Needs the
 * repository's history; a shallow clone would date every page to its one commit, so it throws
 * there instead (CI checks out the full history).
 */

let checkedHistory = false;

function git(args: readonly string[]): string {
  return execFileSync('git', args, {encoding: 'utf8'}).trim();
}

/** The last commit date of `paths` as an ISO 8601 string, or `undefined` before their first commit. */
export function lastUpdated(paths: readonly string[]): string | undefined {
  if (!checkedHistory) {
    if (git(['rev-parse', '--is-shallow-repository']) === 'true') {
      throw new Error(
        'Docs page dates need the full Git history; fetch it with `git fetch --unshallow`.',
      );
    }
    checkedHistory = true;
  }
  return git(['log', '-1', '--format=%cI', '--', ...paths]) || undefined;
}

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Formats a date as `D MMM YYYY` in UTC, such as `1 Sep 2026`, like pi.dev. `Intl.DateTimeFormat`
 * is not used because some locales abbreviate September as "Sept".
 */
export function formatCalendarDate(date: Date): string {
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}
