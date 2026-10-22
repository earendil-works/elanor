# Shared color palette

The shared palette uses four logo colors, a compatible positive green, a violet for code syntax, and tint-free Graphite.

## Palette model

Each OKLCH key is emitted unchanged as `primitive.color.<family>` (`$root` for scaled families). Scales keep its hue, decrease OKHSL lightness linearly, and use bell-curve saturation for quieter extremes. Output is rounded DTCG OKLCH with matching hex fallbacks; see [generation details](token-generation.md#color-scale).

Resting colors use core steps `100`–`900` by hundreds, plus structural `25` (light canvas) and `50`. Other intermediate steps are for hover/active only.

| Family           | Key       |     Hue | Saturation min–max | Purpose                                                   |
| ---------------- | --------- | ------: | -----------------: | --------------------------------------------------------- |
| `cerulianBlue`   | `#4D9ABF` | 231.49° |             10–68% | Logo color; information, selection, and links             |
| `coralRed`       | `#F08F88` |     25° |             10–92% | Logo color; negative and destructive states               |
| `creamYellow`    | `#F1BE58` |  82.36° |            50–100% | Logo color; warning and attention states                  |
| `calamineBlue`   | `#83CCD2` | 202.43° |             10–72% | Logo color; supporting accent                             |
| `turquoiseGreen` | `#6AB98E` | 158.68° |             10–76% | Compatible green; positive and success states             |
| `amethystViolet` | `#A798D6` |    295° |             10–72% | Code syntax: types, classes, and built-ins                |
| `graphite`       | `#6E6E6E` |       – |                 0% | Logo wordmark; neutral content and structural backgrounds |

Logo key hex fallbacks match the logo artwork exactly.

## Standalone colors

Brand black and white are key-only `primitive.color.<name>` tokens for logos and UI, not pure endpoints. Scales calculate between pure white (`0`) and black (`1000`), so `graphite.25` is lighter than `white`.

| Token   | Key (OKLCH L C H) | Hex       |
| ------- | ----------------- | --------- |
| `black` | `0.1776 0 0`      | `#111111` |
| `white` | `0.9731 0 0`      | `#F6F6F6` |

## Print builds

Recipe `print` values become CMYK builds in `com.earendil-works.print`:

| Token          | CMYK, PSO Coated v3 | CMYK, PSO Uncoated v3 |
| -------------- | ------------------- | --------------------- |
| `cerulianBlue` | 66 20 10 6          | 67 15 7 4             |
| `coralRed`     | 1 53 36 0           | 1 50 33 0             |
| `creamYellow`  | 4 26 71 1           | 3 21 70 0             |
| `calamineBlue` | 49 0 18 0           | 44 0 14 0             |
| `graphite`     | 0 0 0 73            | 0 0 0 79              |
| `black`        | 0 0 0 100           | 0 0 0 100             |
| `white`        | 0 0 0 0             | 0 0 0 0               |

Converted from sRGB with LittleCMS, relative colorimetric intent, and black-point compensation. Coated colors are within ΔE2000 1.5; uncoated paper cannot reach the saturated colors. Neutrals use lightness-matched black ink only. `white` means no ink (paper knockout); use white spot ink on dark stock. Verify these best-effort values with a printed proof.

## Logo colors

Use `semantic.color.logo.*` only for logo artwork: `symbol.1`–`4` use the four logo keys; `wordmark` and `earendil` use `graphite` in light mode and `white` in dark; `monochrome` uses `black`/`white`.

## Semantic mapping

| Semantic role                                     | Primitive family |
| ------------------------------------------------- | ---------------- |
| Default primary, information, selected, and links | `cerulianBlue`   |
| Neutral                                           | `graphite`       |
| Warning                                           | `creamYellow`    |
| Negative                                          | `coralRed`       |
| Positive                                          | `turquoiseGreen` |

`calamineBlue` is a supporting brand accent without a semantic status role. `amethystViolet` is used for code syntax and as a participant color.

Participant colors (`background.fill.participant.1`–`6`) use all six chromatic families, in the order `cerulianBlue`, `coralRed`, `turquoiseGreen`, `amethystViolet`, `calamineBlue`, `creamYellow`: the fill is step `100` in light and `780` in dark, the name `600` in light and `300` in dark.

Structural backgrounds are neutral Graphite in both themes:

| Theme | Canvas                     | Surface                    |
| ----- | -------------------------- | -------------------------- |
| Light | `graphite.25` (`#F8F8F8`)  | `graphite.50` (`#F1F1F1`)  |
| Dark  | `graphite.900` (`#161616`) | `graphite.800` (`#2E2E2E`) |

Primary and ghost fills each have default, neutral, information, negative, and positive variants; default and information intentionally use the same Cerulian Blue steps. Every variant uses these steps of its family:

| Fill    | Light rest / hover / active | Dark rest / hover / active  |
| ------- | --------------------------- | --------------------------- |
| Primary | `600` / `640` / `680`       | `400` / `360` / `320`       |
| Ghost   | transparent / `40` / `80`   | transparent / `860` / `820` |

Consumers use [semantic fill roles](token-naming.md#color-fill-roles), not family names.

## Contrast audit

Required WCAG 2.1 resting-state pairs:

- ordinary text and content on canvas, surface, primary fills, and secondary fills at **4.5:1**;
- source code text (`semantic.color.text.code` and its roles) on the secondary fill at **4.5:1**;
- meaningful borders, focus rings, selected fills, indicators, and switch knobs at **3:1**.

All 196 pairs pass. The smallest margin is dark selected fill on dark surface: **3.09:1** against **3:1** required. Run `pnpm tokens:check:contrast` to recheck.

Project policy excludes hover/active states from conformance checks. Secondary borders, secondary fills against their surroundings, and transparent ghost fills may fall below 3:1 only when decorative or lower-prominence and not the sole cue for a control or state.
