import svgpath from 'svgpath';

/** Deliberately small asset contract: baked, closed, filled paths; no SVG effects. */
export function readBrush(svg) {
  if (/<(?:image|use|filter|mask|clipPath|rect|circle|ellipse|polygon|polyline|line)\b|\b(?:transform|stroke)\s*=/i.test(svg)) {
    throw new Error('Brush SVG must contain only baked filled paths (no transforms, strokes, clipping or effects).');
  }
  const viewBox = svg.match(/viewBox=["']([^"']+)["']/)?.[1].trim().split(/[\s,]+/).map(Number);
  if (!viewBox || viewBox.length !== 4 || viewBox.some((n) => !Number.isFinite(n)) || viewBox[2] <= 0 || viewBox[3] <= 0) {
    throw new Error('Brush SVG needs a valid viewBox.');
  }
  const polygons = [];
  for (const match of svg.matchAll(/<path\b[^>]*\bd=["']([^"']+)["'][^>]*\/?\s*>/g)) {
    let points = [], current = [0, 0];
    const path = svgpath(match[1]).abs().unarc().unshort();
    if (path.err) throw new Error(path.err);
    path.iterate((segment) => {
      const [command, ...v] = segment;
      if (command === 'M') {
        if (points.length) throw new Error('Brush paths must be closed with Z.');
        current = v;
        points = [v];
      } else if (command === 'Z') {
        if (points.length > 2) polygons.push(points);
        current = points[0];
        points = [];
      } else {
        const start = current;
        let controls;
        if (command === 'L') controls = [start, v];
        else if (command === 'H') controls = [start, [v[0], start[1]]];
        else if (command === 'V') controls = [start, [start[0], v[0]]];
        else if (command === 'C') controls = [start, v.slice(0, 2), v.slice(2, 4), v.slice(4, 6)];
        else if (command === 'Q') controls = [start, v.slice(0, 2), v.slice(2, 4)];
        else throw new Error(`Unsupported SVG command: ${command}`);
        const length = controls.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - controls[i][0], p[1] - controls[i][1]), 0);
        const count = Math.max(1, Math.ceil(length / 0.08));
        for (let i = 1; i <= count; i++) {
          const t = i / count;
          let work = controls;
          while (work.length > 1) work = work.slice(1).map((p, j) => [work[j][0] * (1 - t) + p[0] * t, work[j][1] * (1 - t) + p[1] * t]);
          points.push(work[0]);
        }
        current = controls.at(-1);
      }
    });
    if (points.length) throw new Error('Brush paths must be closed with Z.');
  }
  if (!polygons.length) throw new Error('Brush SVG has no filled paths.');
  return {viewBox, polygons};
}

export function clipPolygon(polygon, [left, top, right, bottom]) {
  let points = polygon;
  for (const [axis, boundary, sign] of [[0, left, 1], [0, right, -1], [1, top, 1], [1, bottom, -1]]) {
    const output = [];
    for (let i = 0; i < points.length; i++) {
      const a = points[i], b = points[(i + 1) % points.length];
      const insideA = sign * (a[axis] - boundary) >= -1e-9;
      const insideB = sign * (b[axis] - boundary) >= -1e-9;
      if (insideA) output.push(a);
      if (insideA !== insideB) {
        const t = (boundary - a[axis]) / (b[axis] - a[axis]);
        const p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
        p[axis] = boundary;
        output.push(p);
      }
    }
    points = output;
  }
  return points;
}

export const number = (n) => String(Math.round(n * 1000) / 1000);
function simplify(points, tolerance = 0.008) {
  if (points.length < 3) return points;
  const a = points[0], b = points.at(-1), dx = b[0] - a[0], dy = b[1] - a[1];
  const length = dx * dx + dy * dy;
  let maximum = tolerance * tolerance, split = -1;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const t = length ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / length)) : 0;
    const distance = (p[0] - a[0] - t * dx) ** 2 + (p[1] - a[1] - t * dy) ** 2;
    if (distance > maximum) { maximum = distance; split = i; }
  }
  return split < 0 ? [a, b] : [...simplify(points.slice(0, split + 1), tolerance).slice(0, -1), ...simplify(points.slice(split), tolerance)];
}
export function pathData(polygons) {
  return polygons.filter((p) => p.length > 2).map((points) => {
    const middle = Math.floor(points.length / 2);
    const reduced = [...simplify(points.slice(0, middle + 1)).slice(0, -1), ...simplify([...points.slice(middle), points[0]]).slice(0, -1)];
    return `M${reduced.map((p) => p.map(number).join(' ')).join('L')}Z`;
  }).join('');
}
export function svgDocument(polygons, viewBox) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox.map(number).join(' ')}" preserveAspectRatio="none"><path fill="black" fill-rule="evenodd" d="${pathData(polygons)}"/></svg>\n`;
}

export function envelope(polygon, x) {
  const ys = [];
  for (let i = 0; i < polygon.length; i++) {
    const a = polygon[i], b = polygon[(i + 1) % polygon.length];
    if (a[0] !== b[0] && x >= Math.min(a[0], b[0]) && x < Math.max(a[0], b[0])) {
      ys.push(a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]));
    }
  }
  if (ys.length < 2) throw new Error(`No brush envelope at x=${x}`);
  return [Math.min(...ys), Math.max(...ys)];
}

/** Arc-length parameterization: tangents and normals remain continuous through corners. */
export function roundedBackbone(width, height, radius, inset) {
  const r = radius - inset;
  if (r <= 0 || width < 2 * radius || height < 2 * radius) throw new Error('Invalid border geometry.');
  const horizontal = width - 2 * radius, vertical = height - 2 * radius, arc = Math.PI * r / 2;
  const length = 2 * (horizontal + vertical) + 4 * arc;
  const segments = [
    [horizontal, (t) => [radius + t, inset, 1, 0]],
    [arc, (t) => circle(width - radius, radius, -Math.PI / 2 + t / r)],
    [vertical, (t) => [width - inset, radius + t, 0, 1]],
    [arc, (t) => circle(width - radius, height - radius, t / r)],
    [horizontal, (t) => [width - radius - t, height - inset, -1, 0]],
    [arc, (t) => circle(radius, height - radius, Math.PI / 2 + t / r)],
    [vertical, (t) => [inset, height - radius - t, 0, -1]],
    [arc, (t) => circle(radius, radius, Math.PI + t / r)],
  ];
  function circle(cx, cy, angle) { return [cx + r * Math.cos(angle), cy + r * Math.sin(angle), -Math.sin(angle), Math.cos(angle)]; }
  return {
    length,
    at(s) {
      s = ((s % length) + length) % length;
      for (const [size, at] of segments) {
        if (s <= size && size > 0) return at(s);
        s -= size;
      }
      return segments[0][1](0);
    },
  };
}
