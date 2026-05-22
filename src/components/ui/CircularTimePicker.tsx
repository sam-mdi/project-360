import React, { useState, useRef, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface CircularTimePickerProps {
  value: string; // "HH:MM"
  onChange: (value: string) => void;
  onDone: () => void;
  onCancel: () => void;
}

const RADIUS = 110;
const CENTER = 140;
const HOUR_RADIUS = 95;
const MIN_RADIUS = 65;

function polarToXY(angle: number, r: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
}

function xyToAngle(x: number, y: number, cx: number, cy: number) {
  const dx = x - cx;
  const dy = y - cy;
  let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  if (angle < 0) angle += 360;
  return angle;
}

export function CircularTimePicker({ value, onChange, onDone, onCancel }: CircularTimePickerProps) {
  const [h, m] = value.split(':').map(Number);
  const [hours, setHours] = useState(h % 12 || 12);
  const [minutes, setMinutes] = useState(m);
  const [ampm, setAmpm] = useState<'am' | 'pm'>(h >= 12 ? 'pm' : 'am');
  const [mode, setMode] = useState<'hour' | 'minute'>('hour');
  const svgRef = useRef<SVGSVGElement>(null);

  const updateTime = useCallback((newH: number, newM: number, newAmpm: 'am' | 'pm') => {
    let h24 = newH % 12;
    if (newAmpm === 'pm') h24 += 12;
    const str = `${h24.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
    onChange(str);
  }, [onChange]);

  const handleSVGClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 280;
    const y = ((e.clientY - rect.top) / rect.height) * 280;
    const angle = xyToAngle(x, y, CENTER, CENTER);

    if (mode === 'hour') {
      const newH = Math.round(angle / 30) % 12 || 12;
      setHours(newH);
      setMode('minute');
      updateTime(newH, minutes, ampm);
    } else {
      const newM = Math.round(angle / 6) % 60;
      const snapped = Math.round(newM / 5) * 5 % 60;
      setMinutes(snapped);
      updateTime(hours, snapped, ampm);
    }
  };

  const hourAngle = ((hours % 12) / 12) * 360;
  const minAngle = (minutes / 60) * 360;
  const hourPos = polarToXY(hourAngle, HOUR_RADIUS);
  const minPos = polarToXY(minAngle, MIN_RADIUS);

  const displayH = hours;
  const displayM = minutes.toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center px-4 pt-4 pb-2 h-full">
      <h2 className="text-lg font-bold text-stone-900 mb-2">Set Time</h2>

      {/* Digital display */}
      <div className="flex items-center gap-1 mb-2">
        <button
          onClick={() => setMode('hour')}
          className={cn(
            'text-4xl font-bold transition-colors px-1 rounded-lg',
            mode === 'hour' ? 'text-amber-500 bg-amber-50' : 'text-stone-700 hover:bg-stone-100'
          )}
        >
          {displayH}
        </button>
        <span className="text-4xl font-bold text-stone-400">:</span>
        <button
          onClick={() => setMode('minute')}
          className={cn(
            'text-4xl font-bold transition-colors px-1 rounded-lg',
            mode === 'minute' ? 'text-amber-500 bg-amber-50' : 'text-stone-700 hover:bg-stone-100'
          )}
        >
          {displayM}
        </button>
        <div className="flex flex-col gap-0.5 ml-1">
          <button
            onClick={() => { setAmpm('am'); updateTime(hours, minutes, 'am'); }}
            className={cn('text-sm font-bold px-1.5 py-0.5 rounded', ampm === 'am' ? 'bg-amber-500 text-white' : 'text-stone-400 hover:bg-stone-100')}
          >AM</button>
          <button
            onClick={() => { setAmpm('pm'); updateTime(hours, minutes, 'pm'); }}
            className={cn('text-sm font-bold px-1.5 py-0.5 rounded', ampm === 'pm' ? 'bg-amber-500 text-white' : 'text-stone-400 hover:bg-stone-100')}
          >PM</button>
        </div>
      </div>

      {/* Clock face */}
      <svg
        ref={svgRef}
        width="280"
        height="280"
        viewBox="0 0 280 280"
        className="cursor-pointer"
        onClick={handleSVGClick}
      >
        {/* Background */}
        <circle cx={CENTER} cy={CENTER} r={RADIUS + 20} fill="#f5f5f4" />

        {/* Hour dots */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = ((i + 1) / 12) * 360;
          const pos = polarToXY(angle, HOUR_RADIUS);
          const isSelected = mode === 'hour' && i + 1 === hours;
          return (
            <g key={i}>
              <circle cx={pos.x} cy={pos.y} r={16} fill={isSelected ? '#f59e0b' : 'transparent'} />
              <text
                x={pos.x} y={pos.y + 5}
                textAnchor="middle"
                fontSize="14"
                fontWeight="600"
                fill={isSelected ? 'white' : '#78716c'}
              >
                {i + 1}
              </text>
            </g>
          );
        })}

        {/* Minute dots */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * 360;
          const pos = polarToXY(angle, MIN_RADIUS);
          const minVal = i * 5;
          const isSelected = mode === 'minute' && minVal === minutes;
          return (
            <g key={i}>
              <circle cx={pos.x} cy={pos.y} r={14} fill={isSelected ? '#f59e0b' : 'transparent'} />
              <text
                x={pos.x} y={pos.y + 5}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill={isSelected ? 'white' : '#a8a29e'}
              >
                {minVal.toString().padStart(2, '0')}
              </text>
            </g>
          );
        })}

        {/* Center dot */}
        <circle cx={CENTER} cy={CENTER} r={4} fill="#f59e0b" />

        {/* Hour hand */}
        {mode === 'hour' && (
          <line
            x1={CENTER} y1={CENTER}
            x2={hourPos.x} y2={hourPos.y}
            stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"
          />
        )}
        {/* Minute hand */}
        {mode === 'minute' && (
          <line
            x1={CENTER} y1={CENTER}
            x2={minPos.x} y2={minPos.y}
            stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round"
          />
        )}
      </svg>

      <p className="text-xs text-stone-400 mb-3">
        {mode === 'hour' ? 'Tap to set hour' : 'Tap to set minutes'}
      </p>

      <div className="w-full flex gap-2 px-0 pb-2">
        <Button variant="secondary" className="flex-1" onClick={onCancel}>Cancel</Button>
        <Button className="flex-1" onClick={onDone}>Done</Button>
      </div>
    </div>
  );
}
