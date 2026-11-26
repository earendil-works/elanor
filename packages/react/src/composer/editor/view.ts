// Derived from TokenInput in vercel-labs/ui (https://github.com/vercel-labs/ui), Copyright 2026
// Vercel, Inc., licensed under the Apache License, Version 2.0, and modified. See
// THIRD-PARTY-NOTICES in this package.
//
// Renders a value into a contenteditable element and turns what the browser does back into the
// value. The engine owns this DOM; `renderChip` renders only inside chip hosts, which keep their
// identity.
//
// The shape follows what the three browser engines need: text nodes; a host per chip,
// `span[contenteditable=false]`; a zero-width space on both sides of every host, without which
// Firefox can't place the caret between two chips or after a final one; and a trailing `<br>` when
// the text is empty or ends in a new line or a chip, which gives the last line its height. Offsets
// skip the zero-width spaces.
import {
  isChip,
  type ComposerChip,
  type ComposerSegment,
  type ComposerValue,
  type ComposerTextRange,
} from './model.ts';

const ZERO_WIDTH_SPACE = '\u200b';
const HOST = 'data-chip-id';
const SENTINEL = 'data-sentinel';

export type Rect = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};

type Layout<T extends ComposerChip> = (string | T | typeof END)[];
const END = Symbol('end');

function layout<T extends ComposerChip>(value: ComposerValue<T>): Layout<T> {
  const nodes: Layout<T> = [];
  const appendText = (text: string) => {
    const last = nodes.at(-1);
    if (typeof last === 'string') nodes[nodes.length - 1] = last + text;
    else nodes.push(text);
  };
  for (const segment of value) {
    if (isChip(segment)) {
      appendText(ZERO_WIDTH_SPACE);
      nodes.push(segment, ZERO_WIDTH_SPACE);
    } else appendText(segment);
  }
  const last = value.at(-1);
  if (last === undefined || isChip(last) || last.endsWith('\n')) nodes.push(END);
  return nodes;
}

const realLength = (text: string): number => text.replaceAll(ZERO_WIDTH_SPACE, '').length;

/** Falls back to `caretRangeFromPoint`: older Chrome and Safari lack `caretPositionFromPoint`. */
function caretFromPoint(x: number, y: number): [Node, number] | null {
  const position = document.caretPositionFromPoint?.(x, y);
  if (position) return [position.offsetNode, position.offset];
  const range = document.caretRangeFromPoint?.(x, y);
  return range ? [range.startContainer, range.startOffset] : null;
}

/**
 * The app renders the chip into `content` (`data-chip-content`); a sibling span holds its screen
 * reader description (`data-description`).
 */
type Host<T extends ComposerChip> = {
  readonly host: HTMLElement;
  readonly content: HTMLElement;
  readonly description: HTMLElement;
  chip: T;
};

export class EditorView<T extends ComposerChip> {
  readonly #element: HTMLElement;
  readonly #describe: (chip: T) => string;
  readonly #onHosts: () => void;
  readonly #hosts = new Map<string, Host<T>>();
  /** How many hosts the last render showed. */
  #shown = 0;

  constructor(element: HTMLElement, describe: (chip: T) => string, onHosts: () => void) {
    this.#element = element;
    this.#describe = describe;
    this.#onHosts = onHosts;
  }

  hosts(): readonly Host<T>[] {
    return [...this.#hosts.values()];
  }

  #hostFor(chip: T): HTMLElement {
    let entry = this.#hosts.get(chip.id);
    if (!entry) {
      const host = document.createElement('span');
      host.setAttribute(HOST, chip.id);
      host.contentEditable = 'false';
      host.spellcheck = false;
      const content = document.createElement('span');
      content.dataset.chipContent = '';
      const description = document.createElement('span');
      description.dataset.description = '';
      host.append(content, description);
      entry = {host, content, description, chip};
      this.#hosts.set(chip.id, entry);
    }
    entry.chip = chip;
    const words = ` ${this.#describe(chip)}`;
    if (entry.description.textContent !== words) entry.description.textContent = words;
    return entry.host;
  }

  /**
   * Patches the children to match the value, reusing text nodes and hosts, so the caret, spelling
   * marks and what `renderChip` drew survive.
   */
  render(value: ComposerValue<T>): void {
    const element = this.#element;
    const used = new Set<string>();
    let cursor = element.firstChild;
    for (const item of layout(value)) {
      if (item === END) {
        // Adopt a trailing `<br>` the browser left after a deletion: WebKit stops inserting line
        // breaks once that `<br>` is replaced.
        if (
          cursor instanceof HTMLElement &&
          (cursor.hasAttribute(SENTINEL) || this.#heightOnly(cursor))
        ) {
          cursor.setAttribute(SENTINEL, '');
          cursor = cursor.nextSibling;
        } else
          element.insertBefore(document.createElement('br'), cursor).setAttribute(SENTINEL, '');
      } else if (typeof item === 'string') {
        if (cursor instanceof Text) {
          if (cursor.data !== item) cursor.data = item;
          cursor = cursor.nextSibling;
        } else element.insertBefore(document.createTextNode(item), cursor);
      } else {
        const host = this.#hostFor(item);
        used.add(item.id);
        if (cursor === host) cursor = cursor.nextSibling;
        else element.insertBefore(host, cursor);
      }
    }
    while (cursor) {
      const next: ChildNode | null = cursor.nextSibling;
      cursor.remove();
      cursor = next;
    }
    let changed = false;
    for (const [id, entry] of this.#hosts) {
      if (used.has(id)) continue;
      entry.host.remove();
      this.#hosts.delete(id);
      changed = true;
    }
    if (changed || used.size !== this.#shown) {
      this.#shown = used.size;
      this.#onHosts();
    }
  }

  /**
   * The value the DOM holds now: text without zero-width spaces, and a chip per known host.
   * Anything else, like a `<div>` a browser wrapped a line in, becomes its text, after a line
   * break.
   */
  read(): ComposerSegment<T>[] {
    const value: ComposerSegment<T>[] = [];
    const walk = (parent: Node, nested: boolean) => {
      parent.childNodes.forEach((node, index) => {
        if (node instanceof Text) value.push(node.data.replaceAll(ZERO_WIDTH_SPACE, ''));
        else if (node instanceof HTMLElement) {
          const id = node.getAttribute(HOST);
          if (id !== null) {
            const entry = this.#hosts.get(id);
            if (entry && entry.host === node) value.push(entry.chip);
          } else if (this.#heightOnly(node)) {
            // Only gives the last line its height.
          } else if (node.localName === 'br') value.push('\n');
          else {
            const block = node.localName === 'div' || node.localName === 'p';
            if (block && (index > 0 || nested)) value.push('\n');
            walk(node, nested || block);
          }
        }
      });
    };
    walk(this.#element, false);
    return value;
  }

  #hostOf(node: Node | null): HTMLElement | null {
    const element = node instanceof Element ? node : (node?.parentElement ?? null);
    const host = element?.closest<HTMLElement>(`[${HOST}]`) ?? null;
    return host && this.#element.contains(host) ? host : null;
  }

  inHost(node: Node | null): boolean {
    return this.#hostOf(node) !== null;
  }

  #heightOnly(node: HTMLElement): boolean {
    return (
      node.hasAttribute(SENTINEL) ||
      (node.localName === 'br' && node.parentNode === this.#element && node.nextSibling === null)
    );
  }

  #lengthOf(node: Node): number {
    if (node instanceof Text) return realLength(node.data);
    if (!(node instanceof HTMLElement)) return 0;
    if (node.hasAttribute(HOST)) return 1;
    if (this.#heightOnly(node)) return 0;
    if (node.localName === 'br') return 1;
    let total = 0;
    for (const child of node.childNodes) total += this.#lengthOf(child);
    return total;
  }

  #startOf(node: Node): number {
    let total = 0;
    for (
      let current: Node | null = node;
      current && current !== this.#element;
      current = current.parentNode
    )
      for (let sibling = current.previousSibling; sibling; sibling = sibling.previousSibling)
        total += this.#lengthOf(sibling);
    return total;
  }

  /**
   * A DOM point as an offset. Inside a host, the chip's start, or its end with `after`, since
   * nothing inside a chip is a caret position.
   */
  offsetAt(node: Node, offset: number, after = false): number {
    const host = this.#hostOf(node);
    if (host) return this.#startOf(host) + (after || (host === node && offset > 0) ? 1 : 0);
    if (node instanceof Text) return this.#startOf(node) + realLength(node.data.slice(0, offset));
    let total = node === this.#element ? 0 : this.#startOf(node);
    for (let index = 0; index < offset && index < node.childNodes.length; index += 1) {
      const child = node.childNodes[index];
      if (child) total += this.#lengthOf(child);
    }
    return total;
  }

  /**
   * The offset at a point in the viewport, as for a drop. On a chip, the side nearer the point.
   * `null` off the text: outside the element, or in its padding below the last line.
   */
  offsetAtPoint(x: number, y: number): number | null {
    const host = this.#hostOf(document.elementFromPoint(x, y));
    if (host) {
      const box = host.getBoundingClientRect();
      const rtl = getComputedStyle(this.#element).direction === 'rtl';
      return this.#startOf(host) + (x > box.left + box.width / 2 !== rtl ? 1 : 0);
    }
    // The caret APIs give the nearest line, also for a point below the last.
    const style = getComputedStyle(this.#element);
    const bottom =
      this.#element.getBoundingClientRect().bottom -
      Number.parseFloat(style.borderBottomWidth) -
      Number.parseFloat(style.paddingBottom);
    const point = y > bottom ? null : caretFromPoint(x, y);
    return point && this.#element.contains(point[0]) ? this.offsetAt(...point) : null;
  }

  /**
   * An offset as a DOM point: inside a text node, after the zero-width space that follows a host
   * and before the one that precedes the next.
   */
  #pointAt(offset: number): [Node, number] {
    let remaining = offset;
    for (const child of this.#element.childNodes) {
      if (child instanceof Text) {
        const length = realLength(child.data);
        if (remaining <= length) {
          let index = child.data.startsWith(ZERO_WIDTH_SPACE) && child.data.length > 1 ? 1 : 0;
          for (let counted = 0; counted < remaining; index += 1)
            if (child.data[index] !== ZERO_WIDTH_SPACE) counted += 1;
          return [child, index];
        }
        remaining -= length;
      } else remaining -= this.#lengthOf(child);
    }
    const last = this.#element.lastChild;
    const sentinel = last instanceof HTMLElement && last.hasAttribute(SENTINEL);
    return [this.#element, this.#element.childNodes.length - (sentinel ? 1 : 0)];
  }

  selection(): ComposerTextRange | null {
    const selection = document.getSelection();
    if (!selection?.rangeCount || !this.#element.contains(selection.anchorNode)) return null;
    const range = selection.getRangeAt(0);
    const start = this.offsetAt(range.startContainer, range.startOffset);
    const end = this.offsetAt(range.endContainer, range.endOffset, !range.collapsed);
    return {start: Math.min(start, end), end: Math.max(start, end)};
  }

  /** The selection's moving end, which Shift and an arrow move. */
  focusOffset(): number | null {
    const selection = document.getSelection();
    if (!selection?.focusNode || !this.#element.contains(selection.focusNode)) return null;
    return this.offsetAt(selection.focusNode, selection.focusOffset);
  }

  /** Moves the selection's focus to `offset`, keeping its anchor. */
  extendTo(offset: number): void {
    const [node, index] = this.#pointAt(offset);
    document.getSelection()?.extend(node, index);
  }

  select({start, end}: ComposerTextRange): void {
    const selection = document.getSelection();
    if (!selection) return;
    const [startNode, startOffset] = this.#pointAt(start);
    const [endNode, endOffset] = start === end ? [startNode, startOffset] : this.#pointAt(end);
    const current = selection.rangeCount ? selection.getRangeAt(0) : null;
    if (
      current?.startContainer === startNode &&
      current.startOffset === startOffset &&
      current.endContainer === endNode &&
      current.endOffset === endOffset
    )
      return;
    selection.setBaseAndExtent(startNode, startOffset, endNode, endOffset);
  }

  /**
   * The caret's rectangle at an offset. A collapsed range in a non-empty text node measures in
   * every engine; an empty line or a point next to a host measures zero, so the neighbouring
   * character or host stands in, else the element's first line.
   */
  rectAt(offset: number): Rect | null {
    if (!this.#element.isConnected) return null;
    const [node, index] = this.#pointAt(offset);
    const range = document.createRange();
    range.setStart(node, index);
    range.collapse(true);
    const rect = range.getBoundingClientRect();
    if (rect.height) return {x: rect.x, y: rect.y, width: 0, height: rect.height};
    const style = getComputedStyle(this.#element);
    const rtl = style.direction === 'rtl';
    // The caret stands after what precedes it: at its right, or at its left in right-to-left text.
    const after = (box: DOMRect): Rect => ({
      x: rtl ? box.left : box.right,
      y: box.y,
      width: 0,
      height: box.height,
    });
    if (node instanceof Text && index > 0) {
      range.setStart(node, index - 1);
      range.setEnd(node, index);
      const before = range.getBoundingClientRect();
      if (before.height) return after(before);
    }
    const previous = node instanceof Text ? node.previousSibling : node.childNodes[index - 1];
    if (previous instanceof HTMLElement && previous.hasAttribute(HOST))
      return after(previous.getBoundingClientRect());
    const box = this.#element.getBoundingClientRect();
    const px = (value: string): number => Number.parseFloat(value) || 0;
    return {
      x: rtl
        ? box.right - px(style.borderRightWidth) - px(style.paddingRight)
        : box.left + px(style.borderLeftWidth) + px(style.paddingLeft),
      y: box.top + px(style.borderTopWidth) + px(style.paddingTop),
      width: 0,
      height: px(style.lineHeight) || box.height,
    };
  }

  /** `data-selected` on the chips in the selection and the armed one, `data-dragging` on those dragged. */
  mark(attribute: 'data-selected' | 'data-dragging', ids: ReadonlySet<string>): void {
    for (const [id, {host}] of this.#hosts) host.toggleAttribute(attribute, ids.has(id));
  }
}
