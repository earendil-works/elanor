export interface SourcePath {
  /** Token path the fill links to, e.g. `semantic.color.logo.symbol.1`. */
  token: string;
  d: string;
  fillRule?: "evenodd";
}

export interface SourceArtwork {
  width: number;
  height: number;
  paths: SourcePath[];
}

const documentPattern = /^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 ([\d.]+) ([\d.]+)">\n((?:  <path [^>]*\/>\n)+)<\/svg>\n$/;
const pathPattern = /^ {2}<path fill="\{([a-z0-9.]+)\}"(?: fill-rule="(evenodd)")? d="([^"]+)"\/>$/;

/**
 * Parses a logo source. Sources are deliberately strict: an `<svg>` with a
 * viewBox at the origin, containing only paths whose fill is a token reference.
 */
export function parseSource(source: string, fileName: string): SourceArtwork {
  const document = documentPattern.exec(source);
  if (!document) {
    throw new Error(`${fileName}: expected <svg xmlns viewBox="0 0 w h"> with one <path> per line and nothing else`);
  }
  const paths = document[3]!.trimEnd().split("\n").map((line, index) => {
    const match = pathPattern.exec(line);
    if (!match) {
      throw new Error(`${fileName}: path ${index + 1} must be <path fill="{token}" [fill-rule="evenodd"] d="…"/>`);
    }
    return {token: match[1]!, d: match[3]!, ...(match[2] ? {fillRule: "evenodd" as const} : {})};
  });
  return {width: Number(document[1]), height: Number(document[2]), paths};
}

export function serializeSource(artwork: SourceArtwork): string {
  const paths = artwork.paths
    .map(({token, d, fillRule}) => `  <path fill="{${token}}"${fillRule ? ` fill-rule="${fillRule}"` : ""} d="${d}"/>`)
    .join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${artwork.width} ${artwork.height}">\n${paths}\n</svg>\n`;
}
