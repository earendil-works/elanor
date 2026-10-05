import {readFile} from "node:fs/promises";
import {resolve} from "node:path";
import {unzipSync} from "fflate";
import {describe, expect, test} from "vitest";
import {createIco, createZip} from "../scripts/lib/containers.js";
import {createPdf, pathOperators} from "../scripts/lib/pdf.js";

const dist = resolve(import.meta.dirname, "../dist");

describe("containers", () => {
  test("zip entries round-trip, PNGs are stored, and archives are reproducible", () => {
    const png = Buffer.from([137, 80, 78, 71, 1, 2, 3]);
    const files = [
      {path: "kit/a.svg", data: Buffer.from("<svg/>".repeat(50))},
      {path: "kit/b.png", data: png},
    ];
    const zip = createZip(files);
    const entries = unzipSync(zip);
    expect(Object.keys(entries)).toEqual(["kit/a.svg", "kit/b.png"]);
    for (const file of files) expect(Buffer.from(entries[file.path]!).equals(file.data)).toBe(true);
    expect(zip.includes(png)).toBe(true);
    expect(createZip(files).equals(zip)).toBe(true);
  });

  test("ico directory points at each PNG", () => {
    const pngs = [16, 32].map((size) => ({size, png: Buffer.from(`png-${size}`)}));
    const ico = createIco(pngs);
    expect(ico.readUInt16LE(4)).toBe(2);
    for (const [index, {size, png}] of pngs.entries()) {
      const entry = 6 + index * 16;
      expect(ico.readUInt8(entry)).toBe(size);
      const start = ico.readUInt32LE(entry + 12);
      expect(ico.subarray(start, start + png.length).equals(png)).toBe(true);
    }
  });
});

describe("pdf", () => {
  test("converts path commands", () => {
    expect(pathOperators("M1 2L3 4H5V6C1 2 3 4 5 6Z")).toBe("1 2 m\n3 4 l\n5 4 l\n5 6 l\n1 2 3 4 5 6 c\nh");
    expect(pathOperators("m1 2l3 4z")).toBe("1 2 m\n4 6 l\nh");
    expect(() => pathOperators("M0 0A1 1 0 0 1 2 2")).toThrow(/Unsupported/);
  });

  test("cross-reference offsets point at their objects", () => {
    const pdf = createPdf(
      {width: 560, height: 560, paths: [{d: "M0 0H560V560Z", cmyk: [66, 20, 10, 6]}]},
      {millimetersPerUnit: 40 / 560, title: "test", outputCondition: "FOGRA51"},
    ).toString("latin1");
    const xref = Number(/startxref\n(\d+)/.exec(pdf)![1]);
    const offsets = [...pdf.slice(xref).matchAll(/^(\d{10}) 00000 n $/gm)].map((match) => Number(match[1]));
    offsets.forEach((offset, index) => expect(pdf.slice(offset).startsWith(`${index + 1} 0 obj`)).toBe(true));
    expect(pdf).toContain("0.66 0.2 0.1 0.06 k");
    expect(pdf).toContain("/MediaBox [0 0 113.38582677165356 113.38582677165356]");
  });
});

describe("built exports", () => {
  test("print PDFs use the CMYK builds from the tokens", async () => {
    const earendil = await readFile(resolve(dist, "kits/earendil/print/psoCoatedV3/earendil-logo-on-light.pdf"), "latin1");
    expect(earendil).toContain("0 0 0 0.73 k");
    const pi = await readFile(resolve(dist, "kits/pi/print/psoUncoatedV3/pi-logo-monochrome-on-light.pdf"), "latin1");
    expect(pi).toContain("0 0 0 1 k");
    expect(pi).toContain("(FOGRA52)");
    const knockout = await readFile(resolve(dist, "kits/pi/print/psoCoatedV3/pi-logo-monochrome-on-dark.pdf"), "latin1");
    expect(knockout).toContain("0 0 0 0 k");
  });

  test("the manifest lists every export", async () => {
    const manifest = JSON.parse(await readFile(resolve(dist, "manifest.json"), "utf8"));
    const earendil = manifest.brands.find((brand: {id: string}) => brand.id === "earendil");
    expect(Object.keys(earendil.favicons)).toEqual(
      expect.arrayContaining(["svg", "ico", "appleTouchIcon", "icon192", "icon512", "maskable", "webmanifest", "html"]),
    );
    expect(earendil.avatars).toHaveLength(4);
    const asset = earendil.assets.find((entry: {id: string}) => entry.id === "earendil-logo-wordmark-horizontal-on-light");
    expect(asset.files).toMatchObject({svg: expect.any(String), png: expect.any(String), pdf: {psoCoatedV3: expect.any(String)}});
    expect(Object.keys(manifest.pressKits)).toEqual(["earendil", "pi", "radius", "lefos"]);
  });

  test("each kit has its own guidelines, and the Earendil kit covers every brand", async () => {
    const pi = await readFile(resolve(dist, "guidelines/pi/BRAND-GUIDELINES.md"), "utf8");
    expect(pi).toMatch(/^# Pi brand guidelines\n/);
    expect(pi).toContain("Write the name as **Pi** in prose.");
    expect(pi).not.toContain("Radius");
    expect(pi).not.toMatch(/\{\{\w+\}\}/);

    const earendil = await readFile(resolve(dist, "guidelines/earendil/BRAND-GUIDELINES.md"), "utf8");
    expect(earendil).toContain("Write the names as **Earendil**, **Pi**, **Radius**, and **Lefos** in prose.");

    const kit = await readFile(resolve(dist, "press-kits/radius-press-kit.zip"));
    expect(kit.includes("radius-press-kit/BRAND-GUIDELINES.md")).toBe(true);
    expect(kit.includes("radius-press-kit/clear-space.png")).toBe(true);
  });

  test("the SVG favicon follows the color scheme only where colors change", async () => {
    const earendil = await readFile(resolve(dist, "kits/earendil/favicons/favicon.svg"), "utf8");
    expect(earendil).toContain("@media (prefers-color-scheme:dark){.cf6f6f6{fill:#f6f6f6}}");
    const pi = await readFile(resolve(dist, "kits/pi/favicons/favicon.svg"), "utf8");
    expect(pi).not.toContain("<style>");
  });
});
