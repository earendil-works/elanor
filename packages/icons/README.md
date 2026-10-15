# Elanor icons

Material Symbols Outlined (20px, weight 400), published as four packages with matching exports:

| Package                                                                 | Directory       | Contents                                    |
| ----------------------------------------------------------------------- | --------------- | ------------------------------------------- |
| [`@earendil-works/elanor-icons`](./plain/README.md)                     | `plain/`        | Plain icons as SVG files                    |
| [`@earendil-works/elanor-icons-react`](./plain/react/README.md)         | `plain/react/`  | Plain icons as React components             |
| [`@earendil-works/elanor-icons-boiled`](./boiled/README.md)             | `boiled/`       | Icons with a hand-drawn “boil” as SVG files |
| [`@earendil-works/elanor-icons-boiled-react`](./boiled/react/README.md) | `boiled/react/` | Boiled icons as React components            |

This directory is the private source package: the vendored `sources/`, search tags in `metadata.json`, the pipeline in `scripts/` and [`config.ts`](./config.ts), and the React icon component in `src/`. Each published package builds itself from it: `plain/` and `boiled/` run `scripts/build.ts` with their variant, and the React packages run `scripts/build-react.ts` on their SVG package and compile `src/create-icon.tsx`.

## Development

```sh
pnpm check    # validate SVGs, complete search tags, and the packages' LICENSE and provenance.json copies
pnpm test     # pipeline, geometry, metadata, and React output tests
pnpm refresh  # re-vendor sources/ from the revision in provenance.json (also updates the copies in plain/ and boiled/)
pnpm --filter @earendil-works/elanor-icons... build   # build one package and what it depends on
```

See [`LICENSE`](./LICENSE).
