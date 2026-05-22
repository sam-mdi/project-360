import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { usePlans } from '../stores/usePlans';
import { PlanSheet } from '../components/plan/PlanSheet';
import { PlanSwitcher } from '../components/plan/PlanSwitcher';
import { WheelOfLife } from '../components/progress/WheelOfLife';
import { Button } from '../components/ui/Button';
import type { WheelOfLifeValues } from '../lib/types';

const DEFAULT_WHEEL: WheelOfLifeValues = {
  health: 5, career: 5, money: 5, love: 5,
  family: 5, friends: 5, fun: 5, spirituality: 5,
};

type SetupStep = 'dates' | 'wheel';

export function PlanPage() {
  const { plans, activePlanId, createPlan } = usePlans();
  const activePlan = plans.find((p) => p.id === activePlanId);

  const [showSetup, setShowSetup] = useState(!activePlan);
  const [setupStep, setSetupStep] = useState<SetupStep>('dates');
  const [planName, setPlanName] = useState('My Plan');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [wheel, setWheel] = useState<WheelOfLifeValues>({ ...DEFAULT_WHEEL });

  const handleCreate = () => {
    if (!startDate || !endDate) return;
    createPlan(
      planName,
      format(startDate, 'yyyy-MM-dd'),
      format(endDate, 'yyyy-MM-dd'),
      wheel
    );
    setShowSetup(false);
  };

  if (showSetup) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <AnimatePresence mode="wait">
          {setupStep === 'dates' && (
            <motion.div
              key="dates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm"
            >
              <h2 className="text-2xl font-bold text-stone-900 mb-1">Create a Plan</h2>
              <p className="text-stone-400 text-sm mb-6">Set your planning period and start tracking</p>

              <div className="mb-4">
                <label className="text-sm font-semibold text-stone-600 block mb-1.5">Plan Name</label>
                <input
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-100 text-stone-900 font-medium outline-none focus:ring-2 focus:ring-amber-400"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="e.g. Q2 2026"
                />
              </div>

              <div className="mb-4">
                <label className="text-sm font-semibold text-stone-600 block mb-1.5">Start Date</label>
                <DatePicker
                  selected={startDate}
                  onChange={setStartDate}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-100 text-stone-900 outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                />
              </div>

              <div className="mb-6">
                <label className="text-sm font-semibold text-stone-600 block mb-1.5">End Date</label>
                <DatePicker
                  selected={endDate}
                  onChange={setEndDate}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate ?? undefined}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-100 text-stone-900 outline-none focus:ring-2 focus:ring-amber-400 text-sm"
                />
              </div>

              <Button
                className="w-full"
                disabled={!startDate || !endDate || !planName}
                onClick={() => setSetupStep('wheel')}
              >
                Next: Wheel of Life →
              </Button>
            </motion.div>
          )}

          {setupStep === 'wheel' && (
            <motion.div
              key="wheel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm"
            >
              <h2 className="text-xl font-bold text-stone-900 mb-1">Rate Your Life Areas</h2>
              <p className="text-stone-400 text-sm mb-4">This becomes your starting baseline</p>

              <WheelOfLife values={wheel} onChange={setWheel} editable />

              <div className="flex gap-2 mt-4">
                <Button variant="secondary" className="flex-1" onClick={() => setSetupStep('dates')}>Back</Button>
                <Button className="flex-1" onClick={handleCreate}>Create Plan</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (!activePlan) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-100 bg-white shrink-0">
        <PlanSwitcher onNew={() => setShowSetup(true)} />
        <div className="ml-auto">
          <span className="text-xs text-stone-400 font-medium">
            {activePlan.startDate} → {activePlan.endDate}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <PlanSheet plan={activePlan} />
      </div>
    </div>
  );
}
