# Shared color palette

The shared primitive palette is based on the four brand colors from our logos, plus a compatible green for positive semantics and the Driftwood neutral.

## Palette model

Each family keeps one OKHSL hue across the scale. OKHSL lightness decreases linearly from step `0` to `1000`, while saturation follows the generator's bell curve so near-white and near-black shades remain quieter than the middle steps. Tokens are emitted as rounded DTCG OKLCH colors with matching hex fallbacks.

The core steps are `25`, `50`, and `100` through `900`. Step `25` provides the near-white light canvas. Other non-hundred steps are generated exclusively for hover and active states; resting semantic colors use only hundred steps or the structural `25` and `50` exceptions.

| Family | Hue | Saturation min–max | Source or purpose |
|---|---:|---:|---|
| `cerulianBlue` | 231.49° | 10–68% | Logo brand color `#4D9ABF`; information, selection, links, and dark structural backgrounds |
| `coralRed` | 20° | 10–92% | Red-shifted from logo brand color `#F09082`; negative and destructive states |
| `creamYellow` | 82.36° | 50–100% | Logo brand color `#F1BE58`; warning and attention states |
| `calamineBlue` | 202.43° | 10–72% | Logo brand color `#83CCD2`; supporting brand accent |
| `turquoiseGreen` | 158.68° | 10–76% | Compatible green `#6AB98E`; positive and success states |
| `driftwood` | 67.57° | 6–8% | Neutral `#5C5752`; neutral content and light structural backgrounds |

## Semantic mapping

| Semantic role | Primitive family |
|---|---|
| Default primary, information, selected, and links | `cerulianBlue` |
| Neutral | `driftwood` |
| Warning | `creamYellow` |
| Negative | `coralRed` |
| Positive | `turquoiseGreen` |

`calamineBlue` serves as a supporting primitive brand accent and has no semantic status role.

Structural backgrounds use different families by theme:

| Theme | Canvas | Surface |
|---|---|---|
| Light | `driftwood.25` (`#F8F8F7`) | `driftwood.50` (`#F2F0EF`) |
| Dark | `cerulianBlue.900` (`#10171B`) | `cerulianBlue.800` (`#1E313B`) |

The default primary fill uses `cerulianBlue`; `fill.primary.information` intentionally uses the same values for explicit informational intent, while `fill.primary.neutral` provides an equally prominent Driftwood alternative. Ghost fills mirror the same default, neutral, information, negative, and positive intent structure. All use consistent resting and interaction steps: `600/640/680` or `40/80` in light mode, and `400/360/320` or `960/920` in dark mode. Semantic aliases retain role-based names, so consumers do not depend on these primitive family decisions.

## Contrast audit

The semantic mappings are checked against the project's required WCAG 2.1 resting-state pairs:

- ordinary text and content on canvas, surface, primary fills, and secondary fills at **4.5:1**;
- meaningful borders, focus rings, selected fills, indicators, and switch knobs at **3:1**.

All 178 required resting-state pairs pass. The weakest relative pass is the dark selected fill against the dark surface at **3.07:1**, against a required **3:1**.

Hover and active states are excluded from contrast conformance under the current project policy. Secondary borders, secondary fills against their surrounding surface, and transparent ghost fills can remain below 3:1 when they are decorative or lower-prominence treatments and are not the only cue identifying a control or communicating state.
