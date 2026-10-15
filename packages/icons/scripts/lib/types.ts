export interface Point {
  x: number;
  y: number;
}

export interface ViewBox {
  minX: number;
  minY: number;
  width: number;
  height: number;
}

export interface Contour {
  points: Point[];
  closed: boolean;
}

/** One icon: a single nonzero-filled path. */
export interface Artwork {
  viewBox: ViewBox;
  d: string;
  /** Width and height in pixels. */
  size: number;
}
