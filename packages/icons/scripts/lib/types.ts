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

export interface ArtworkPath {
  d: string;
  fillRule: "nonzero" | "evenodd";
}

export interface Artwork {
  viewBox: ViewBox;
  paths: ArtworkPath[];
}
