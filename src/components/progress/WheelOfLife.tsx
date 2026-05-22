
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import type { WheelOfLifeValues } from '../../lib/types';

interface WheelOfLifeProps {
  values: WheelOfLifeValues;
  compare?: WheelOfLifeValues;
  onChange?: (values: WheelOfLifeValues) => void;
  editable?: boolean;
}

const AREAS: { key: keyof WheelOfLifeValues; label: string }[] = [
  { key: 'health', label: 'Health' },
  { key: 'career', label: 'Career' },
  { key: 'money', label: 'Money' },
  { key: 'love', label: 'Love' },
  { key: 'family', label: 'Family' },
  { key: 'friends', label: 'Friends' },
  { key: 'fun', label: 'Fun' },
  { key: 'spirituality', label: 'Spirit' },
];

export function WheelOfLife({ values, compare, onChange, editable }: WheelOfLifeProps) {
  const data = AREAS.map(({ key, label }) => ({
    subject: label,
    value: values[key],
    compare: compare?.[key],
  }));

  return (
    <div>
      <ResponsiveContainer width="100%" height={240}>
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#e7e5e4" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#78716c', fontWeight: 600 }} />
          <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fontSize: 9, fill: '#a8a29e' }} />
          <Radar
            name="Current"
            dataKey="value"
            stroke="#f59e0b"
            fill="#f59e0b"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          {compare && (
            <Radar
              name="Start"
              dataKey="compare"
              stroke="#a8a29e"
              fill="#a8a29e"
              fillOpacity={0.1}
              strokeWidth={1.5}
              strokeDasharray="4 4"
            />
          )}
        </RadarChart>
      </ResponsiveContainer>

      {editable && onChange && (
        <div className="grid grid-cols-2 gap-3 mt-3">
          {AREAS.map(({ key, label }) => (
            <div key={key}>
              <div className="flex justify-between text-xs font-medium text-stone-600 mb-1">
                <span>{label}</span>
                <span className="text-amber-500 font-bold">{values[key]}</span>
              </div>
              <input
                type="range"
                min={1} max={10} step={1}
                value={values[key]}
                onChange={(e) => onChange({ ...values, [key]: Number(e.target.value) })}
                className="w-full"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
