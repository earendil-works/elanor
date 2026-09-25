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

## Brand colors

The exact logo colors live in `primitive.color.brand`. The four chromatic ones are generated from the `brand` field of their palette family's recipe, which checks that the family keeps the brand color's hue (`coralRed` is intentionally red-shifted and opts out). The neutrals are authored manually.

| Token | sRGB | CMYK, PSO Coated v3 | CMYK, PSO Uncoated v3 |
|---|---|---|---|
| `brand.cerulianBlue` | `#4D9ABF` | 66 20 10 6 | 67 15 7 4 |
| `brand.coralRed` | `#F09082` | 1 53 41 0 | 1 49 37 0 |
| `brand.creamYellow` | `#F1BE58` | 4 26 71 1 | 3 21 70 0 |
| `brand.calamineBlue` | `#83CCD2` | 49 0 18 0 | 44 0 14 0 |
| `brand.gray` | `#6E6E6C` | 0 0 0 73 | 0 0 0 79 |
| `brand.paleBlue` | `#D4DDED` | 18 10 2 0 | 15 7 1 0 |
| `brand.black` | `#111111` | 0 0 0 100 | 0 0 0 100 |
| `brand.white` | `#F6F6F6` | knockout or white ink | knockout or white ink |

CMYK builds are stored in the `com.earendil-works.print` extension. They were converted with LittleCMS from sRGB using relative colorimetric intent with black-point compensation (coated colors land within ΔE2000 1.5; uncoated paper cannot reach the saturated colors). Neutrals use black ink only, matched to the same lightness. Treat them as best-effort values until checked against a printed proof.

Semantic `semantic.color.logo.*` tokens map these onto logo roles (`symbol.1`–`4`, `wordmark`, `earendil`, `monochrome`) per color scheme. Use them only for logo artwork.

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
