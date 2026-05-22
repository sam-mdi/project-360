import { useState } from 'react';
import { ChevronDown, Plus, Copy, Trash2 } from 'lucide-react';
import { usePlans } from '../../stores/usePlans';
import { cn } from '../../lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

interface PlanSwitcherProps {
  onNew: () => void;
}

export function PlanSwitcher({ onNew }: PlanSwitcherProps) {
  const { plans, activePlanId, setActivePlan, duplicatePlan, deletePlan } = usePlans();
  const [open, setOpen] = useState(false);
  const activePlan = plans.find((p) => p.id === activePlanId);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 transition-colors text-sm font-semibold text-stone-700"
      >
        {activePlan?.name ?? 'Select Plan'}
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute top-full left-0 mt-1 bg-white rounded-2xl shadow-xl border border-stone-100 z-50 min-w-52 overflow-hidden"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 hover:bg-stone-50 transition-colors cursor-pointer group',
                  plan.id === activePlanId && 'bg-amber-50'
                )}
                onClick={() => { setActivePlan(plan.id); setOpen(false); }}
              >
                <span className="flex-1 text-sm font-medium text-stone-700">{plan.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); duplicatePlan(plan.id); setOpen(false); }}
                  className="p-1 rounded hover:bg-stone-200 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Copy size={12} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deletePlan(plan.id); setOpen(false); }}
                  className="p-1 rounded hover:bg-rose-100 text-stone-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            <div className="border-t border-stone-100 p-2">
              <button
                onClick={() => { onNew(); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-amber-50 text-amber-600 text-sm font-semibold transition-colors"
              >
                <Plus size={14} />
                New Plan
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  );
}
