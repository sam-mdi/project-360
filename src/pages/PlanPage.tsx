import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { Plus, ChevronLeft, Download, Columns3, FileDown } from 'lucide-react';
import { usePlans } from '../stores/usePlans';
import { PlanSheet } from '../components/plan/PlanSheet';
import { WheelOfLife } from '../components/progress/WheelOfLife';
import { Button } from '../components/ui/Button';
import { InlineEdit } from '../components/ui/InlineEdit';
import { ProgressBar } from '../components/ui/ProgressBar';
import type { Plan, WheelOfLifeValues } from '../lib/types';

const DEFAULT_WHEEL: WheelOfLifeValues = {
  health: 5, career: 5, money: 5, love: 5,
  family: 5, friends: 5, fun: 5, spirituality: 5,
};

type SetupStep = 'dates' | 'wheel';

function getPlanCompletion(plan: Plan): number {
  if (plan.rows.length === 0 || plan.columns.length === 0) return 0;
  const toggleCols = plan.columns.filter((c) => c.type === 'toggle');
  if (toggleCols.length === 0) return 0;
  let total = 0;
  let done = 0;
  plan.rows.forEach((row) => {
    toggleCols.forEach((col) => {
      total++;
      if (row.values[col.id] === 1) done++;
    });
  });
  return total > 0 ? done / total : 0;
}

// ── Plans grid / list view ───────────────────────────────────────────────────

function PlansListView({
  plans,
  onOpen,
  onNew,
}: {
  plans: Plan[];
  onOpen: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
      >
        {plans.map((plan) => {
          const pct = getPlanCompletion(plan);
          const days = plan.rows.length;
          const colCount = plan.columns.length;

          return (
            <motion.div
              key={plan.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group bg-white rounded-2xl border border-stone-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-all cursor-pointer relative"
              onClick={() => onOpen(plan.id)}
            >
              {/* Name */}
              <div>
                <h3 className="font-extrabold text-stone-900 text-lg leading-tight truncate">
                  {plan.name}
                </h3>
                <p className="text-xs text-stone-400 font-medium mt-0.5">
                  {plan.startDate} → {plan.endDate}
                </p>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  <Columns3 size={12} />
                  {colCount} {colCount === 1 ? 'topic' : 'topics'}
                </span>
                <span>{days} days</span>
              </div>

              {/* Completion */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-stone-500">Completion</span>
                  <span className="text-xs font-bold text-stone-700">
                    {Math.round(pct * 100)}%
                  </span>
                </div>
                <ProgressBar value={pct} />
              </div>

              {/* Open button — visible on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpen(plan.id);
                  }}
                  className="w-full py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-400 transition-colors"
                >
                  Open →
                </button>
              </div>
            </motion.div>
          );
        })}

        {/* New plan card */}
        <motion.button
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onNew}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-stone-200 p-8 text-stone-400 hover:border-amber-400 hover:text-amber-500 transition-all min-h-48"
        >
          <Plus size={28} strokeWidth={1.5} />
          <span className="text-sm font-semibold">New Plan</span>
        </motion.button>
      </div>

      {plans.length === 0 && (
        <div className="text-center py-16 text-stone-400 pointer-events-none">
          <p className="text-sm">Create your first plan above</p>
        </div>
      )}
    </div>
  );
}

// ── Plan setup wizard ────────────────────────────────────────────────────────

function PlanSetup({
  onDone,
  onCancel,
}: {
  onDone: (id: string) => void;
  onCancel: () => void;
}) {
  const { createPlan } = usePlans();
  const [step, setStep] = useState<SetupStep>('dates');
  const [planName, setPlanName] = useState('My Plan');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [wheel, setWheel] = useState<WheelOfLifeValues>({ ...DEFAULT_WHEEL });

  const handleCreate = () => {
    if (!startDate || !endDate) return;
    const id = createPlan(
      planName,
      format(startDate, 'yyyy-MM-dd'),
      format(endDate, 'yyyy-MM-dd'),
      wheel
    );
    onDone(id);
  };

  return (
    <div className="flex items-center justify-center h-full p-6">
      <AnimatePresence mode="wait">
        {step === 'dates' && (
          <motion.div
            key="dates"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-sm"
          >
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 mb-4 font-semibold"
            >
              <ChevronLeft size={14} /> Back to plans
            </button>
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
              onClick={() => setStep('wheel')}
            >
              Next: Wheel of Life →
            </Button>
          </motion.div>
        )}

        {step === 'wheel' && (
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
              <Button variant="secondary" className="flex-1" onClick={() => setStep('dates')}>Back</Button>
              <Button className="flex-1" onClick={handleCreate}>Create Plan</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Plan spreadsheet view ────────────────────────────────────────────────────

function PlanSpreadsheetView({
  plan,
  onBack,
}: {
  plan: Plan;
  onBack: () => void;
}) {
  const { updatePlan, addColumn, exportCSV } = usePlans();
  const [exporting, setExporting] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleExport = () => {
    const csv = exportCSV(plan.id);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePDF = async () => {
    if (!sheetRef.current || exporting) return;
    setExporting(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const canvas = await html2canvas(sheetRef.current, { scale: 1.5, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width / 1.5, canvas.height / 1.5] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 1.5, canvas.height / 1.5);
      pdf.save(`${plan.name}.pdf`);
    } catch (_) {}
    setExporting(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-100 bg-white shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-stone-800 transition-colors"
        >
          <ChevronLeft size={16} />
          Plans
        </button>

        <div className="w-px h-4 bg-stone-200" />

        <InlineEdit
          value={plan.name}
          onChange={(name) => updatePlan(plan.id, { name })}
          className="text-sm font-bold text-stone-900"
          placeholder="Plan name"
        />

        <span className="text-xs text-stone-400 font-medium ml-1">
          {plan.startDate} → {plan.endDate}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={handleExport}>
            <Download size={13} /> CSV
          </Button>
          <Button size="sm" variant="outline" onClick={handlePDF} disabled={exporting}>
            <FileDown size={13} /> {exporting ? '…' : 'PDF'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => addColumn(plan.id, { label: 'New Column', type: 'toggle' })}
          >
            <Plus size={13} /> Add Column
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden" ref={sheetRef}>
        <PlanSheet plan={plan} hideToolbar />
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export function PlanPage() {
  const { plans } = usePlans();
  const [viewingPlanId, setViewingPlanId] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);

  const viewingPlan = plans.find((p) => p.id === viewingPlanId);

  if (showSetup) {
    return (
      <PlanSetup
        onDone={(id) => {
          setViewingPlanId(id);
          setShowSetup(false);
        }}
        onCancel={() => setShowSetup(false)}
      />
    );
  }

  if (viewingPlanId && viewingPlan) {
    return (
      <PlanSpreadsheetView
        plan={viewingPlan}
        onBack={() => setViewingPlanId(null)}
      />
    );
  }

  return (
    <PlansListView
      plans={plans}
      onOpen={(id) => setViewingPlanId(id)}
      onNew={() => setShowSetup(true)}
    />
  );
}
