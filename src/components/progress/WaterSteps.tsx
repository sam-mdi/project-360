import { useTracking } from '../../stores/useTracking';
import { useSettings } from '../../stores/useSettings';
import { format } from 'date-fns';
import { Droplets, Footprints, Plus, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';

export function WaterSteps() {
  const { waterGoal, stepsGoal } = useSettings();
  const { getWater, setWater, getSteps, setSteps } = useTracking();
  const today = format(new Date(), 'yyyy-MM-dd');

  const water = getWater(today);
  const steps = getSteps(today);

  const waterPct = Math.min(1, water / waterGoal);
  const stepsPct = Math.min(1, steps / stepsGoal);

  const handleStepsChange = (delta: number) => {
    setSteps(today, Math.max(0, steps + delta));
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Water */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
        <div className="flex items-center gap-1.5 mb-3">
          <Droplets size={15} className="text-sky-500" />
          <h3 className="text-xs font-bold text-stone-700">Water</h3>
          <span className="ml-auto text-xs text-stone-400">{water}/{waterGoal}</span>
        </div>

        {/* Glasses grid */}
        <div className="grid grid-cols-4 gap-1 mb-3">
          {Array.from({ length: waterGoal }, (_, i) => (
            <button
              key={i}
              onClick={() => setWater(today, i < water ? i : i + 1)}
              className={cn(
                'aspect-square rounded-lg transition-all flex items-center justify-center text-sm',
                i < water ? 'bg-sky-500' : 'bg-sky-100 hover:bg-sky-200'
              )}
            >
              <Droplets size={12} className={i < water ? 'text-white' : 'text-sky-400'} />
            </button>
          ))}
        </div>

        <div className="h-1.5 rounded-full bg-sky-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-sky-500 transition-all"
            style={{ width: `${waterPct * 100}%` }}
          />
        </div>
        <p className="text-xs text-stone-400 mt-1 text-center">
          {water >= waterGoal ? '🎉 Goal reached!' : `${waterGoal - water} more to go`}
        </p>
      </div>

      {/* Steps */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
        <div className="flex items-center gap-1.5 mb-3">
          <Footprints size={15} className="text-emerald-500" />
          <h3 className="text-xs font-bold text-stone-700">Steps</h3>
        </div>

        <p className="text-2xl font-bold text-stone-900 text-center mb-1">
          {steps.toLocaleString()}
        </p>
        <p className="text-xs text-stone-400 text-center mb-3">
          goal: {stepsGoal.toLocaleString()}
        </p>

        <div className="h-1.5 rounded-full bg-emerald-100 overflow-hidden mb-3">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${stepsPct * 100}%` }}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleStepsChange(-500)}
            className="flex-1 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-colors"
          >
            <Minus size={12} className="text-stone-600" />
          </button>
          <button
            onClick={() => handleStepsChange(500)}
            className="flex-1 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 flex items-center justify-center transition-colors"
          >
            <Plus size={12} className="text-emerald-600" />
          </button>
        </div>
        <p className="text-[10px] text-stone-400 text-center mt-1">±500 steps</p>
      </div>
    </div>
  );
}
