import {describe, expect, test} from "vitest";
import {composeArtwork, composeLockup} from "../scripts/lib/compose.js";
import {addDecimal, translatePath} from "../scripts/lib/path-data.js";
import {parseSource, serializeSource, type SourceArtwork} from "../scripts/lib/svg.js";

describe("exact translation", () => {
  test.each([
    ["276.608", -0.5, "276.108"],
    ["-2.59998", 20, "17.40002"],
    ["0", 196.5, "196.5"],
    ["-0.5", 0.5, "0"],
    ["63.0149", 792, "855.0149"],
  ])("%s + %s = %s", (value, offset, expected) => {
    expect(addDecimal(value, offset)).toBe(expected);
  });

  test("moves only absolute coordinates", () => {
    expect(translatePath("M1 2L3 4H5V6C1 2 3 4 5 6Z", 10, 100)).toBe("M11 102L13 104H15V106C11 102 13 104 15 106Z");
    expect(translatePath("m1 2l3 4h5v6z", 10, 100)).toBe("m11 102l3 4h5v6z");
    expect(translatePath("M1 2 3 4 5 6", 10, 0)).toBe("M11 2 13 4 15 6");
    expect(translatePath("M1 2A5 5 0 0 1 3 4", 10, 100)).toBe("M11 102A5 5 0 0 1 13 104");
  });

  test("leaves the path untouched without an offset", () => {
    expect(translatePath("M1,2 L3,4", 0, 0)).toBe("M1,2 L3,4");
  });
});

describe("sources", () => {
  const source = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 560">\n  <path fill="{semantic.color.logo.symbol.1}" d="M0 0H1Z"/>\n</svg>\n';

  test("round-trip", () => {
    expect(serializeSource(parseSource(source, "test"))).toBe(source);
  });

  test("reject anything but token-linked paths", () => {
    expect(() => parseSource(source.replace("{semantic.color.logo.symbol.1}", "#4d9abf"), "test")).toThrow();
    expect(() => parseSource(source.replace("<path ", '<path id="x" '), "test")).toThrow();
    expect(() => parseSource(source.replace("</svg>", "<g/>\n</svg>"), "test")).toThrow();
  });
});

describe("lockups match the Figma components", () => {
  const part = (width: number, height: number): SourceArtwork => ({
    width,
    height,
    paths: [{token: "semantic.color.logo.wordmark", d: "M0 0Z"}],
  });
  const origin = (artwork: {paths: Array<{d: string}>}, index: number) =>
    artwork.paths[index]!.d.match(/^M([\d.-]+) ([\d.-]+)/)!.slice(1).map(Number);

  test("horizontal product lockup", () => {
    const lockup = composeLockup(part(560, 560), part(475, 560), "pi", "horizontal");
    expect([lockup.width, lockup.height]).toEqual([1267, 600]);
    expect(origin(lockup, 0)).toEqual([0, 20]);
    expect(origin(lockup, 1)).toEqual([792, 20]);
  });

  test("stacked product lockup", () => {
    const lockup = composeLockup(part(560, 560), part(167, 200), "pi", "stacked");
    expect([lockup.width, lockup.height]).toEqual([560, 900]);
    expect(origin(lockup, 1)).toEqual([196.5, 700]);
  });

  test("Earendil lockups have no block padding", () => {
    const horizontal = composeLockup(part(560, 840), part(3266, 840), "earendil", "horizontal");
    expect([horizontal.width, horizontal.height]).toEqual([4058, 840]);
    const stacked = composeLockup(part(560, 840), part(1139, 200), "earendil", "stacked");
    expect([stacked.width, stacked.height]).toEqual([1139, 1180]);
    expect(origin(stacked, 0)).toEqual([289.5, 0]);
  });

  test.each([
    ["pi", "logo-wordmark-horizontal", 1267, 600],
    ["pi", "logo-wordmark-stacked", 560, 900],
    ["radius", "logo-wordmark-horizontal", 3295, 600],
    ["radius", "logo-wordmark-stacked", 844, 900],
    ["lefos", "logo-wordmark-horizontal", 2667, 600],
    ["lefos", "logo-wordmark-stacked", 643, 900],
    ["earendil", "logo-wordmark-horizontal", 4058, 840],
    ["earendil", "logo-wordmark-stacked", 1139, 1180],
  ] as const)("%s %s from sources is %sx%s", async (brand, kind, width, height) => {
    for (const monochrome of [false, true]) {
      const artwork = await composeArtwork(brand, kind, monochrome);
      expect([artwork.width, artwork.height]).toEqual([width, height]);
    }
  });
});
