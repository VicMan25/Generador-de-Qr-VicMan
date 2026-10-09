import type { CornerCenterStyle, CornerFrameStyle, DotStyle } from '../design/defaults';

/** Miniaturas que representan cada estilo en el panel de diseño. */

const DOT_CELLS = [
  [0, 0],
  [1, 0],
  [0, 1],
  [2, 1],
  [1, 2],
  [2, 2],
];

/** Cuadrado con radios distintos por esquina: [sup-izq, sup-der, inf-der, inf-izq]. */
function roundedRect(x: number, y: number, s: number, [a, b, c, d]: number[]) {
  return `M${x + a},${y} H${x + s - b} Q${x + s},${y} ${x + s},${y + b} V${y + s - c} Q${x + s},${y + s} ${x + s - c},${y + s} H${x + d} Q${x},${y + s} ${x},${y + s - d} V${y + a} Q${x},${y} ${x + a},${y} Z`;
}

const DOT_RADII: Record<Exclude<DotStyle, 'dots'>, number[]> = {
  square: [0, 0, 0, 0],
  rounded: [0.22, 0.22, 0.22, 0.22],
  'extra-rounded': [0.4, 0.4, 0.4, 0.4],
  classy: [0.4, 0, 0.4, 0],
  'classy-rounded': [0.4, 0.15, 0.4, 0.15],
};

export function DotSwatch({ style }: { style: DotStyle }) {
  return (
    <svg viewBox="-0.2 -0.2 3.4 3.4" fill="currentColor">
      {DOT_CELLS.map(([x, y]) =>
        style === 'dots' ? (
          <circle key={`${x}${y}`} cx={x + 0.5} cy={y + 0.5} r={0.42} />
        ) : (
          <path key={`${x}${y}`} d={roundedRect(x + 0.06, y + 0.06, 0.88, DOT_RADII[style])} />
        ),
      )}
    </svg>
  );
}

export function CornerFrameSwatch({ style }: { style: CornerFrameStyle }) {
  return (
    <svg viewBox="0 0 7 7" fill="none" stroke="currentColor" strokeWidth={1}>
      {style === 'dot' ? (
        <circle cx={3.5} cy={3.5} r={3} />
      ) : (
        <rect x={0.5} y={0.5} width={6} height={6} rx={style === 'extra-rounded' ? 1.8 : 0} />
      )}
      <rect x={2.25} y={2.25} width={2.5} height={2.5} fill="currentColor" stroke="none" opacity={0.25} />
    </svg>
  );
}

export function CornerCenterSwatch({ style }: { style: CornerCenterStyle }) {
  return (
    <svg viewBox="0 0 7 7" fill="currentColor">
      <rect x={0.5} y={0.5} width={6} height={6} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.25} />
      {style === 'dot' ? <circle cx={3.5} cy={3.5} r={1.5} /> : <rect x={2} y={2} width={3} height={3} />}
    </svg>
  );
}
