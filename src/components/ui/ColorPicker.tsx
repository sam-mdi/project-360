import { useState } from 'react';
import type { BlockColor } from '../../lib/types';
import { Button } from './Button';

interface ColorPickerProps {
  value?: BlockColor;
  onSelect: (color: BlockColor) => void;
  onCancel: () => void;
}

// Colors mapped to their angles around the wheel (15° per segment × 24 = 360°)
const WHEEL_COLORS: Array<{ key: BlockColor; name: string; hex: string; angle: number }> = [
  { key: 'watermelon',  name: 'Watermelon',  hex: '#FF4D6D', angle: 0   },
  { key: 'strawberry',  name: 'Strawberry',  hex: '#E91E8C', angle: 15  },
  { key: 'rust',        name: 'Rust',        hex: '#B5451B', angle: 30  },
  { key: 'salmon',      name: 'Salmon',      hex: '#FF8A80', angle: 45  },
  { key: 'mandarin',    name: 'Mandarin',    hex: '#FF5722', angle: 60  },
  { key: 'pumpkin',     name: 'Pumpkin',     hex: '#FF6D00', angle: 75  },
  { key: 'apricot',     name: 'Apricot',     hex: '#FFAB40', angle: 90  },
  { key: 'honey',       name: 'Honey',       hex: '#FFB300', angle: 105 },
  { key: 'mustard',     name: 'Mustard',     hex: '#F9A825', angle: 120 },
  { key: 'butter',      name: 'Butter',      hex: '#FFF176', angle: 135 },
  { key: 'lime',        name: 'Lime',        hex: '#76FF03', angle: 150 },
  { key: 'sage',        name: 'Sage',        hex: '#8BC34A', angle: 165 },
  { key: 'teal',        name: 'Teal',        hex: '#009688', angle: 180 },
  { key: 'sky',         name: 'Sky',         hex: '#29B6F6', angle: 195 },
  { key: 'periwinkle',  name: 'Periwinkle',  hex: '#7986CB', angle: 210 },
  { key: 'lavender',    name: 'Lavender',    hex: '#CE93D8', angle: 225 },
  { key: 'amethyst',    name: 'Amethyst',    hex: '#7B1FA2', angle: 240 },
  { key: 'lilac',       name: 'Lilac',       hex: '#F48FB1', angle: 255 },
  { key: 'orchid',      name: 'Orchid',      hex: '#BA68C8', angle: 270 },
  { key: 'fuchsia',     name: 'Fuchsia',     hex: '#E040FB', angle: 285 },
  { key: 'carnation',   name: 'Carnation',   hex: '#FF80AB', angle: 300 },
  { key: 'ultra',       name: 'Ultra',       hex: '#5C6BC0', angle: 315 },
  { key: 'slate',       name: 'Slate',       hex: '#607D8B', angle: 330 },
  { key: 'stone',       name: 'Stone',       hex: '#9E9E9E', angle: 345 },
];

const CX = 140;
const CY = 140;
const R_OUTER = 126;
const R_INNER = 34;
const SLICE_DEG = 15;

function polarToXY(r: number, angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return {
    x: +(CX + r * Math.cos(rad)).toFixed(3),
    y: +(CY + r * Math.sin(rad)).toFixed(3),
  };
}

function slicePath(startAngle: number, endAngle: number) {
  const s = polarToXY(R_OUTER, startAngle);
  const e = polarToXY(R_OUTER, endAngle);
  const s2 = polarToXY(R_INNER, endAngle);
  const e2 = polarToXY(R_INNER, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return [
    `M ${s.x} ${s.y}`,
    `A ${R_OUTER} ${R_OUTER} 0 ${large} 1 ${e.x} ${e.y}`,
    `L ${s2.x} ${s2.y}`,
    `A ${R_INNER} ${R_INNER} 0 ${large} 0 ${e2.x} ${e2.y}`,
    'Z',
  ].join(' ');
}

function checkmarkAt(midAngle: number) {
  const midR = (R_INNER + R_OUTER) / 2;
  const c = polarToXY(midR, midAngle);
  return c;
}

export function ColorPicker({ value, onSelect, onCancel }: ColorPickerProps) {
  const [selected, setSelected] = useState<BlockColor>(value ?? 'sky');
  const [hovered, setHovered] = useState<BlockColor | null>(null);

  const displayKey = hovered ?? selected;
  const displayColor = WHEEL_COLORS.find((c) => c.key === displayKey);
  const selectedColor = WHEEL_COLORS.find((c) => c.key === selected);

  // Center text (split long names onto 2 lines)
  const centerName = selectedColor?.name ?? '';
  const useSmallFont = centerName.length > 7;
  const line1 = useSmallFont ? centerName.slice(0, Math.ceil(centerName.length / 2)) : centerName;
  const line2 = useSmallFont ? centerName.slice(Math.ceil(centerName.length / 2)) : '';

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-lg font-bold text-stone-900">Pick a Color</h2>
      </div>

      {/* Color wheel */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-2">
        <svg
          width="280"
          height="280"
          viewBox="0 0 280 280"
          style={{ display: 'block', cursor: 'pointer' }}
        >
          {WHEEL_COLORS.map(({ key, hex, angle }) => {
            const isSelected = selected === key;
            const isHovered = hovered === key;
            const path = slicePath(angle, angle + SLICE_DEG);
            const midAngle = angle + SLICE_DEG / 2;
            const chk = checkmarkAt(midAngle);

            return (
              <g key={key}>
                <path
                  d={path}
                  fill={hex}
                  stroke="white"
                  strokeWidth={isSelected ? 3 : 1.5}
                  opacity={isHovered && !isSelected ? 0.8 : 1}
                  style={{
                    filter: isSelected ? 'brightness(1.1)' : isHovered ? 'brightness(1.15)' : undefined,
                    transition: 'opacity 0.1s, filter 0.1s',
                  }}
                  onMouseEnter={() => setHovered(key)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelected(key)}
                />
                {isSelected && (
                  <>
                    <circle cx={chk.x} cy={chk.y} r={9} fill="white" opacity={0.92} />
                    <polyline
                      points={`${chk.x - 4},${chk.y} ${chk.x - 1},${chk.y + 3} ${chk.x + 5},${chk.y - 4}`}
                      fill="none"
                      stroke={hex}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </>
                )}
              </g>
            );
          })}

          {/* Donut hole — white fill with selected color name */}
          <circle cx={CX} cy={CY} r={R_INNER} fill="white" />

          {/* Thin color ring inside donut hole */}
          {selectedColor && (
            <circle
              cx={CX}
              cy={CY}
              r={R_INNER - 5}
              fill="none"
              stroke={selectedColor.hex}
              strokeWidth={5}
            />
          )}

          {/* Center text */}
          <text
            x={CX}
            y={CY + (useSmallFont ? -5 : 0)}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={useSmallFont ? 7.5 : 9.5}
            fontWeight="bold"
            fill={selectedColor?.hex ?? '#78716c'}
            style={{ pointerEvents: 'none', userSelect: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {useSmallFont ? (
              <>
                <tspan x={CX} dy="0">{line1}</tspan>
                <tspan x={CX} dy="11">{line2}</tspan>
              </>
            ) : (
              centerName
            )}
          </text>
        </svg>

        {/* Color name label below wheel */}
        <div className="h-8 flex items-center justify-center">
          {displayColor && (
            <span
              className="text-xl font-extrabold tracking-tight transition-all"
              style={{ color: displayColor.hex }}
            >
              {displayColor.name}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-stone-100 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button className="flex-1" onClick={() => onSelect(selected)}>Next</Button>
      </div>
    </div>
  );
}
