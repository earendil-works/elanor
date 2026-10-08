# Shared color palette

The shared primitive palette is based on the four colors from our logos, plus a compatible green for positive semantics and the tint-free Graphite neutral.

## Palette model

Every color starts from a key color, authored in OKLCH in the color recipe. The key is emitted exactly as the family's own token, `primitive.color.<family>` (the group's `$root`), and the family's scale is generated around it.

Each family keeps its key's hue across the whole scale (OKLCH and OKHSL share hue angles), so a family never drifts from its key color. OKHSL lightness decreases linearly from step `0` to `1000`, while saturation follows the generator's bell curve so near-white and near-black shades remain quieter than the middle steps. Tokens are emitted as rounded DTCG OKLCH colors with matching hex fallbacks.

The core steps are `25`, `50`, and `100` through `900`. Step `25` provides the near-white light canvas. Other non-hundred steps are generated exclusively for hover and active states; resting semantic colors use only hundred steps or the structural `25` and `50` exceptions.

| Family           | Key       |     Hue | Saturation min–max | Purpose                                                                    |
| ---------------- | --------- | ------: | -----------------: | -------------------------------------------------------------------------- |
| `cerulianBlue`   | `#4D9ABF` | 231.49° |             10–68% | Logo color; information, selection, links, and dark structural backgrounds |
| `coralRed`       | `#F08F88` |     25° |             10–92% | Logo color; negative and destructive states                                |
| `creamYellow`    | `#F1BE58` |  82.36° |            50–100% | Logo color; warning and attention states                                   |
| `calamineBlue`   | `#83CCD2` | 202.43° |             10–72% | Logo color; supporting accent                                              |
| `turquoiseGreen` | `#6AB98E` | 158.68° |             10–76% | Compatible green; positive and success states                              |
| `graphite`       | `#6E6E6E` |       – |                 0% | Logo wordmark; neutral content and light structural backgrounds            |

Hex values are the derived fallbacks of the OKLCH keys and match the logo artwork exactly.

## Standalone colors

Colors without a scale have only a key, emitted as `primitive.color.<name>`. They are the brand black and white, used by both the logos and the UI. They are deliberately not pure black and white: scales are still calculated between pure white (step `0`) and pure black (step `1000`), so `graphite.25` is slightly lighter than `white` and `graphite.960` slightly darker than `black`.

| Token   | Key (OKLCH L C H) | Hex       |
| ------- | ----------------- | --------- |
| `black` | `0.1776 0 0`      | `#111111` |
| `white` | `0.9731 0 0`      | `#F6F6F6` |

## Print builds

Key colors used in print carry CMYK builds in the `com.earendil-works.print` extension, authored as `print` in the recipe.

| Token          | CMYK, PSO Coated v3 | CMYK, PSO Uncoated v3 |
| -------------- | ------------------- | --------------------- |
| `cerulianBlue` | 66 20 10 6          | 67 15 7 4             |
| `coralRed`     | 1 53 36 0           | 1 50 33 0             |
| `creamYellow`  | 4 26 71 1           | 3 21 70 0             |
| `calamineBlue` | 49 0 18 0           | 44 0 14 0             |
| `graphite`     | 0 0 0 73            | 0 0 0 79              |
| `black`        | 0 0 0 100           | 0 0 0 100             |
| `white`        | 0 0 0 0             | 0 0 0 0               |

They were converted with LittleCMS from sRGB using relative colorimetric intent with black-point compensation (coated colors land within ΔE2000 1.5; uncoated paper cannot reach the saturated colors). Neutrals use black ink only, matched to the same lightness. `white` prints no ink, so it knocks out to the paper; use a white ink spot color instead when printing on dark stock. Treat them as best-effort values until checked against a printed proof.

## Logo colors

Semantic `semantic.color.logo.*` tokens map key colors onto logo roles per color scheme: `symbol.1`–`4` use the four logo family keys, `wordmark` and `earendil` use the `graphite` key (light) or `white` (dark), and `monochrome` uses `black` or `white`. Use them only for logo artwork.

## Semantic mapping

| Semantic role                                     | Primitive family |
| ------------------------------------------------- | ---------------- |
| Default primary, information, selected, and links | `cerulianBlue`   |
| Neutral                                           | `graphite`       |
| Warning                                           | `creamYellow`    |
| Negative                                          | `coralRed`       |
| Positive                                          | `turquoiseGreen` |

`calamineBlue` serves as a supporting primitive brand accent and has no semantic status role.

Structural backgrounds use different families by theme:

| Theme | Canvas                         | Surface                        |
| ----- | ------------------------------ | ------------------------------ |
| Light | `graphite.25` (`#F8F8F8`)      | `graphite.50` (`#F1F1F1`)      |
| Dark  | `cerulianBlue.900` (`#10171B`) | `cerulianBlue.800` (`#1E313B`) |

The default primary fill uses `cerulianBlue`; `fill.primary.information` intentionally uses the same values for explicit informational intent, while `fill.primary.neutral` provides an equally prominent Graphite alternative. Ghost fills mirror the same default, neutral, information, negative, and positive intent structure. All use consistent resting and interaction steps: `600/640/680` or `40/80` in light mode, and `400/360/320` or `960/920` in dark mode. Semantic aliases retain role-based names, so consumers do not depend on these primitive family decisions.

## Contrast audit

The semantic mappings are checked against the project's required WCAG 2.1 resting-state pairs:

- ordinary text and content on canvas, surface, primary fills, and secondary fills at **4.5:1**;
- meaningful borders, focus rings, selected fills, indicators, and switch knobs at **3:1**.

All 178 required resting-state pairs pass. The weakest relative pass is the dark selected fill against the dark surface at **3.07:1**, against a required **3:1**.

Hover and active states are excluded from contrast conformance under the current project policy. Secondary borders, secondary fills against their surrounding surface, and transparent ghost fills can remain below 3:1 when they are decorative or lower-prominence treatments and are not the only cue identifying a control or communicating state.
