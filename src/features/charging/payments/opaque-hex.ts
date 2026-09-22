function toHex(channel: number) {
  return Math.round(channel).toString(16).padStart(2, '0');
}

function parseColor(color: string): [number, number, number, number] {
  const rgba = color.match(/^rgba?\(([^)]+)\)$/);
  if (rgba) {
    const [r, g, b, a = 1] = rgba[1].split(',').map((part) => Number(part.trim()));
    return [r, g, b, a];
  }
  const hex = color.replace('#', '');
  return [0, 2, 4].map((offset) => parseInt(hex.slice(offset, offset + 2), 16)).concat(1) as [
    number,
    number,
    number,
    number,
  ];
}

export function toOpaqueHex(color: string, backdrop: string) {
  const [r, g, b, a] = parseColor(color);
  const [br, bg, bb] = parseColor(backdrop);
  const blend = (front: number, back: number) => front * a + back * (1 - a);
  return `#${toHex(blend(r, br))}${toHex(blend(g, bg))}${toHex(blend(b, bb))}`;
}
