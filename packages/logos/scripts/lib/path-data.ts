/**
 * Exact translation of SVG path data.
 *
 * Coordinates are added as decimal strings (scaled integers), so translating a
 * path never introduces floating-point noise: `276.608` moved by `-0.5` is
 * exactly `276.108`. Nothing else about the path is changed.
 */

const tokenPattern = /[A-Za-z]|[+-]?(?:\d+\.?\d*|\.\d+)/g;

/** Per-command parameter roles for absolute commands: x, y, or neither. */
const roles: Readonly<Record<string, ReadonlyArray<"x" | "y" | "-">>> = {
  M: ["x", "y"],
  L: ["x", "y"],
  T: ["x", "y"],
  H: ["x"],
  V: ["y"],
  C: ["x", "y", "x", "y", "x", "y"],
  S: ["x", "y", "x", "y"],
  Q: ["x", "y", "x", "y"],
  A: ["-", "-", "-", "-", "-", "x", "y"],
  Z: [],
};

export function translatePath(d: string, dx: number, dy: number): string {
  if (dx === 0 && dy === 0) return d;
  if (/[eE]/.test(d)) throw new Error("Exponent notation is not supported in path data");
  if (d.replace(tokenPattern, "").replace(/[\s,]/g, "") !== "") {
    throw new Error("Path data contains unexpected characters");
  }

  const tokens = d.match(tokenPattern) ?? [];
  const output: string[] = [];
  let command = "";
  let index = 0;
  let first = true;

  while (index < tokens.length) {
    const token = tokens[index]!;
    if (/[A-Za-z]/.test(token)) {
      if (!(token.toUpperCase() in roles)) throw new Error(`Unsupported path command ${token}`);
      command = token;
      output.push(token);
      index += 1;
      if (token.toUpperCase() === "Z") continue;
    } else if (command === "" || command.toUpperCase() === "Z") {
      throw new Error("Path data has a number without a command");
    }

    const upper = command.toUpperCase();
    const commandRoles = roles[upper]!;
    // A leading relative move is relative to the origin, so it is absolute in effect.
    const absolute = command === upper || (first && command === "m");
    for (const role of commandRoles) {
      const value = tokens[index];
      if (value === undefined || /[A-Za-z]/.test(value)) throw new Error(`Path command ${command} has missing parameters`);
      output.push(absolute && role === "x" ? addDecimal(value, dx) : absolute && role === "y" ? addDecimal(value, dy) : value);
      index += 1;
    }
    first = false;
    // Extra coordinate pairs after a move are implicit line commands.
    if (upper === "M") command = command === "M" ? "L" : "l";
  }

  return joinTokens(output);
}

function joinTokens(tokens: string[]): string {
  let output = "";
  let previous = "";
  for (const token of tokens) {
    const isNumber = !/^[A-Za-z]$/.test(token);
    const previousIsNumber = previous !== "" && !/^[A-Za-z]$/.test(previous);
    const needsSeparator =
      isNumber && previousIsNumber && !token.startsWith("-") && !(token.startsWith(".") && previous.includes("."));
    output += (needsSeparator ? " " : "") + token;
    previous = token;
  }
  return output;
}

export function addDecimal(value: string, offset: number): string {
  if (offset === 0) return value;
  const offsetText = String(offset);
  if (/[eE]/.test(offsetText)) throw new Error(`Offset ${offset} cannot be represented exactly`);
  const decimals = Math.max(fractionDigits(value), fractionDigits(offsetText));
  const sum = toScaled(value, decimals) + toScaled(offsetText, decimals);
  return fromScaled(sum, decimals);
}

function fractionDigits(value: string): number {
  const dot = value.indexOf(".");
  return dot === -1 ? 0 : value.length - dot - 1;
}

function toScaled(value: string, decimals: number): bigint {
  const negative = value.startsWith("-");
  const [whole = "0", fraction = ""] = value.replace(/^[+-]/, "").split(".");
  const digits = `${whole || "0"}${fraction.padEnd(decimals, "0")}`;
  return (negative ? -1n : 1n) * BigInt(digits);
}

function fromScaled(value: bigint, decimals: number): string {
  const negative = value < 0n;
  const digits = (negative ? -value : value).toString().padStart(decimals + 1, "0");
  const whole = digits.slice(0, digits.length - decimals);
  const fraction = digits.slice(digits.length - decimals).replace(/0+$/, "");
  const text = fraction ? `${whole}.${fraction}` : whole;
  return negative && text !== "0" ? `-${text}` : text;
}
