# npm releases

The npm packages are listed in `scripts/release/packages.mjs`.
Main snapshots need no npm release; see [Preview packages](../README.md#preview-packages).

The first version of each package is published manually, because npm trusted publishing can only be configured for existing packages:

1. Run `pnpm release:check <directory>` and publish its tarballs in `packages.mjs` order with `npm publish <directory>/<tarball> --access public`. Do not publish from package directories: npm would not resolve `workspace:` dependencies.
2. Configure each package’s npm trusted publisher as `earendil-works/elanor` with workflow `publish.yml`.

Tagging a version that is already on npm skips publishing, so the manual versions need no tag.

## Prepare

1. Bump each package you want to release. Versions are independent and need not match the Git tag.
2. If a package needs changes in another Elanor package, bump both. One tag releases both; icons publish before React.
3. Use stable `X.Y.Z` versions higher than the package’s existing stable releases.
4. Run `pnpm release:check`. It checks packed packages without publishing.
5. Merge the changes to `main` after review.

## Publish

Tag the reviewed main commit:

```sh
git tag vX.Y.Z <reviewed-main-commit>
git push origin vX.Y.Z
```

Use a new tag for each release. Wait for one release to finish before starting another.

**Publish npm packages** validates new packages alongside already-published dependencies, then publishes missing versions. Existing versions are skipped.

After npm succeeds, **Preview packages** creates the permanent `vX.Y.Z` pkg release without moving `@main`.

## Retry

- npm failed: fix the cause and select **Re-run all jobs**. Already-published versions are skipped.
- pkg failed after npm succeeded: select **Re-run all jobs** on that **Preview packages** run.
- Do not rerun only a publish job.
- If code or versions must change, merge a new commit and use a new tag. Never move tags or unpublish versions.

## Verify

Run `npm view <package>@<version>` and install from npm in a fresh project.
Check that the tag’s **Preview packages** run also succeeded.
