# `@earendil-works/elanor-docs-kit`

A documentation site from a folder of Markdown, built with Elanor's components, design tokens, and fonts. Put Markdown in `docs/` and run one command; configure only what you need to change.

```sh
npx @earendil-works/elanor-docs-kit dev     # http://localhost:4321, reloads on changes
npx @earendil-works/elanor-docs-kit build   # writes the site to ./site
```

The command is also installed as `elanor-docs`. It runs [Astro](https://astro.build) on a project of its own in a cache folder, so a repository needs no Astro project, `package.json`, or Node setup beyond the command.

## What you get

- **Pages:** every `.md` file. `guide/setup.md` is served at `guide/setup/`; `index.md` (or `README.md` without an `index.md` beside it) at its folder.
- **Navigation:** from the folders and the pages' front matter: the top-level pages, then a group for each folder (led by its `index.md`) or for each `sidebar.group` the pages name, sorted by `sidebar.order`. A side navigation on wide screens, a menu on narrow ones, and links to the previous and next page.
- **Page header:** the title, when the page last changed (from Git), and a button that copies its Markdown.
- **Top navigation:** the project's name and brand symbol, configured links, search, a GitHub button for the repository, and the color scheme toggle.
- **Table of contents:** the page's `##` and `###` headings, beside the content on wide screens, a menu above it on narrower ones. Headings get links to copy.
- **Search:** a search dialog over every page and section (⌘K, Ctrl+K, or `/`).
- **Markdown:** GitHub Flavored Markdown, inline HTML, code highlighted with Elanor's code colors, with copy buttons, and GitHub's alerts (`> [!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`).
- **From MkDocs and Zensical:** Python-Markdown's tabs (`=== "TypeScript"`, kept in sync across a page and remembered) and admonitions (`!!! warning "Title"`, and `??? note` collapsed).
- **Links:** relative links to other Markdown files point at their pages, links to images and other files of the folder at the copies the site publishes, and links outside the folder (`../src/main.ts`) at the repository on GitHub. Broken links are warnings, or errors with `--strict`.
- **For agents:** every page's Markdown beside it (`guide/setup.md`), linked from the page, and an [`llms.txt`](https://llmstxt.org) that lists them.
- **The rest:** light and dark color schemes, the logo (or the brand's symbol) as the favicon, a 404 page, canonical and social tags.

## Defaults

| Setting      | Default                                                                                   |
| ------------ | ----------------------------------------------------------------------------------------- |
| Markdown     | `docs/`, or the current folder without one                                                |
| Name         | `package.json`'s `name` (unless private), otherwise the repository's name                 |
| Address      | The repository's GitHub Pages address, such as `https://earendil-works.github.io/absurd/` |
| Repository   | The Git remote `origin`, when it is on GitHub                                             |
| Brand        | `earendil`                                                                                |
| Last updated | Each file's last commit; shallow clones show no dates                                     |

The site's path follows from the address: `/absurd/` for the address above. Set `site` for another host.

## Configuration

Put `elanor-docs.json` next to the Markdown. Every field is optional.

```json
{
  "name": "Absurd",
  "description": "A Postgres-native durable workflow system.",
  "brand": "earendil",
  "logo": {"light": "brand/logo.svg", "dark": "brand/logo-dark.svg"},
  "favicon": "brand/favicon.svg",
  "site": "https://earendil-works.github.io/absurd/",
  "repository": "https://github.com/earendil-works/absurd",
  "branch": "main",
  "lastUpdated": true,
  "links": [{"label": "Changelog", "href": "https://github.com/earendil-works/absurd/releases"}],
  "customCss": ["theme.css"],
  "components": {"Footer": "footer.astro"},
  "strict": false
}
```

| Field         | What it does                                                                                                                                                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | Shown beside the brand's symbol and in page titles                                                                                                                                                                                     |
| `description` | For search engines, link previews, and `llms.txt`                                                                                                                                                                                      |
| `brand`       | The design tokens and symbol: `earendil`, `pi`, `radius`, `lefos`, or `elanor`                                                                                                                                                         |
| `logo`        | The logo beside the name: an image of the Markdown folder (`"logo.svg"`), `{"light", "dark", "replacesName"}` for a dark-mode version or a wordmark that replaces the name, or `false` for the name alone. Default: the brand's symbol |
| `favicon`     | An image of the Markdown folder. Default: the logo (unless it replaces the name), otherwise the brand's symbol                                                                                                                         |
| `site`        | Where the site is published                                                                                                                                                                                                            |
| `repository`  | The repository's address, for the GitHub button and links to its files                                                                                                                                                                 |
| `branch`      | The branch that links to the repository's files point at                                                                                                                                                                               |
| `lastUpdated` | `false` hides the dates                                                                                                                                                                                                                |
| `links`       | Links in the top navigation                                                                                                                                                                                                            |
| `customCss`   | Stylesheets loaded after the kit's; use the design tokens' custom properties                                                                                                                                                           |
| `components`  | Replace parts of the page, see below                                                                                                                                                                                                   |
| `strict`      | Fail the build on broken links and other problems                                                                                                                                                                                      |

Pages read YAML front matter:

```yaml
---
title: Setting up # Instead of the first heading
description: How to set it up. # Instead of the first paragraph
draft: true # Leave the page out
sidebar:
  label: Setup # The name in the navigation
  group: Guide # The navigation group; default: the page's top folder
  order: 1 # Sorts a group's pages, lower first, then by name; a group sorts by its lowest
  hidden: true # Build the page, but leave it out of the navigation
---
```

### Replacing parts of the page

`components` names `.astro` (or React) files, relative to the Markdown, that replace these parts:

| Slot            | Default                                |
| --------------- | -------------------------------------- |
| `Head`          | Nothing; add tags such as analytics    |
| `Identity`      | The brand's symbol and the site's name |
| `BeforeArticle` | Nothing; above every page's title      |
| `AfterArticle`  | Nothing; after every page's content    |
| `Footer`        | Nothing; below every page              |

Each gets `config` (the resolved configuration) and `page` (the current page, absent on the 404 page) as props. They can import `@earendil-works/elanor-react` and the kit's own parts from `@earendil-works/elanor-docs-kit/components/*` without installing them:

```astro
---
import {Link, Text} from '@earendil-works/elanor-react';

const {config} = Astro.props;
---

<footer>
  <Text>{config.name} is built by <Link href="https://earendil.com">Earendil</Link>.</Text>
</footer>
```

### An Astro project of your own

For more than that, use the kit as an Astro integration in an Astro project, with the same options:

```ts
// astro.config.ts
import {defineConfig} from 'astro/config';
import elanorDocs from '@earendil-works/elanor-docs-kit';

export default defineConfig({
  integrations: [elanorDocs({docs: './docs', brand: 'pi'})],
});
```

The integration adds the pages, the search index, and `llms.txt`; the project's own pages sit beside them.

## Publishing on GitHub Pages

```yaml
# .github/workflows/docs.yml
name: Docs
on:
  push:
    branches: [main]
  pull_request:
permissions:
  contents: read
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # The whole history, for the pages' "Last updated" dates
      - uses: actions/setup-node@v4
        with:
          node-version: 24
      - run: npx @earendil-works/elanor-docs-kit build --strict
      - uses: actions/upload-pages-artifact@v3
        if: github.event_name != 'pull_request'
        with:
          path: site
  deploy:
    needs: build
    if: github.event_name != 'pull_request'
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

## How it works

- `src/cli.ts`: the command. It resolves the configuration, links Astro and React into a project in `node_modules/.cache/elanor-docs` (or the system's temporary folder), and runs Astro there.
- `src/index.ts`: the Astro integration. It adds the routes, the stylesheets (the brand's tokens, Elanor's components, the fonts, the kit's layout), the page scripts, and virtual modules for the configuration and the replaceable parts. The dev server watches the Markdown.
- `runtime/`: published as source, compiled by Vite. `content/` reads the folder (`site.ts`) and renders Markdown to HAST (`markdown.ts`, `extensions.ts`); `components/` renders it with Elanor's React components on the server; `scripts/` attaches Elanor's behaviors to the static markup, as Elanor's own docs do; pages ship no React.

## Not yet

- MDX and live examples.
- Nested navigation groups.
- Versioned docs and translations.
- A social card image.
