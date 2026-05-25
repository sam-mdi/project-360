import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Star } from 'lucide-react';
import { useReviews } from '../../stores/useReviews';
import { useRoutine } from '../../stores/useRoutine';
import { format, startOfWeek, subDays } from 'date-fns';
import Confetti from 'react-confetti';

type Step = 'wentWell' | 'improve' | 'intention' | 'summary';
const STEPS: Step[] = ['wentWell', 'improve', 'intention', 'summary'];

interface WeeklyReviewProps {
  onClose: () => void;
}

export function WeeklyReview({ onClose }: WeeklyReviewProps) {
  const { addReview } = useReviews();
  const { dailyRoutines } = useRoutine();
  const [step, setStep] = useState<Step>('wentWell');
  const [wentWell, setWentWell] = useState('');
  const [improve, setImprove] = useState('');
  const [intention, setIntention] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);

  const stepIdx = STEPS.indexOf(step);

  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const weekDates = Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
  );

  const weekStats = (() => {
    let totalBlocks = 0;
    let doneBlocks = 0;
    let daysWithData = 0;
    weekDates.forEach((date) => {
      const r = dailyRoutines.find((r) => r.date === date);
      if (r && r.blockIds.length > 0) {
        daysWithData++;
        totalBlocks += r.blockIds.length;
        doneBlocks += r.actuals.filter((a) => a.endedAt && a.notes !== 'skipped').length;
      }
    });
    return { totalBlocks, doneBlocks, daysWithData, completionRate: totalBlocks > 0 ? Math.round((doneBlocks / totalBlocks) * 100) : 0 };
  })();

  const handleFinish = () => {
    addReview({
      weekStart,
      wentWell,
      improve,
      intention,
      stats: weekStats,
    });
    setShowConfetti(true);
    setTimeout(() => { setShowConfetti(false); onClose(); }, 2500);
  };

  const stepContent: Record<Step, { title: string; subtitle: string; value: string; setter: (v: string) => void; placeholder: string }> = {
    wentWell: {
      title: "What went well this week?",
      subtitle: "Celebrate your wins, big and small",
      value: wentWell,
      setter: setWentWell,
      placeholder: "I completed my morning routine 5 days in a row, finished the project proposal…",
    },
    improve: {
      title: "What could be better?",
      subtitle: "Be honest with yourself",
      value: improve,
      setter: setImprove,
      placeholder: "I could improve my focus time in the afternoon, reduce phone distractions…",
    },
    intention: {
      title: "Your intention for next week",
      subtitle: "One clear focus makes all the difference",
      value: intention,
      setter: setIntention,
      placeholder: "This week I will prioritize deep work in the mornings and finish the product roadmap…",
    },
    summary: {
      title: "Week Complete!",
      subtitle: "Great job reflecting on your week",
      value: '',
      setter: () => {},
      placeholder: '',
    },
  };

  const current = stepContent[step];

  return (
    <>
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} tweenDuration={3000} />}
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-white rounded-t-3xl w-full max-w-lg shadow-2xl px-6 pt-6 pb-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-1">
              {STEPS.filter(s => s !== 'summary').map((s, i) => (
                <div
                  key={s}
                  className={`h-1.5 w-8 rounded-full transition-all ${i <= stepIdx ? 'bg-amber-500' : 'bg-stone-200'}`}
                />
              ))}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400">
              <X size={16} />
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
            >
              {step === 'summary' ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
                    <Star size={28} className="text-amber-500" />
                  </div>
                  <h2 className="text-xl font-bold text-stone-900 mb-1">{current.title}</h2>
                  <p className="text-sm text-stone-500 mb-6">{current.subtitle}</p>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-emerald-50 rounded-2xl p-3">
                      <p className="text-2xl font-bold text-emerald-600">{weekStats.doneBlocks}</p>
                      <p className="text-xs text-emerald-600 font-medium mt-0.5">Blocks done</p>
                    </div>
                    <div className="bg-amber-50 rounded-2xl p-3">
                      <p className="text-2xl font-bold text-amber-600">{weekStats.completionRate}%</p>
                      <p className="text-xs text-amber-600 font-medium mt-0.5">Completion</p>
                    </div>
                    <div className="bg-violet-50 rounded-2xl p-3">
                      <p className="text-2xl font-bold text-violet-600">{weekStats.daysWithData}</p>
                      <p className="text-xs text-violet-600 font-medium mt-0.5">Active days</p>
                    </div>
                  </div>

                  {intention && (
                    <div className="bg-amber-50 rounded-2xl p-4 mb-6 text-left">
                      <p className="text-xs font-bold text-amber-600 mb-1">This week's intention</p>
                      <p className="text-sm text-stone-700">{intention}</p>
                    </div>
                  )}

                  <button
                    onClick={handleFinish}
                    className="w-full py-3 rounded-2xl bg-amber-500 text-white font-bold text-base hover:bg-amber-400 transition-colors"
                  >
                    Finish Review 🎉
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-stone-900 mb-1">{current.title}</h2>
                  <p className="text-sm text-stone-500 mb-4">{current.subtitle}</p>
                  <textarea
                    value={current.value}
                    onChange={(e) => current.setter(e.target.value)}
                    placeholder={current.placeholder}
                    rows={5}
                    autoFocus
                    className="w-full px-4 py-3 rounded-2xl bg-stone-100 text-sm outline-none focus:ring-2 focus:ring-amber-300 resize-none leading-relaxed"
                  />
                  <div className="flex gap-3 mt-4">
                    {stepIdx > 0 && (
                      <button
                        onClick={() => setStep(STEPS[stepIdx - 1])}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-stone-100 text-stone-600 text-sm font-semibold hover:bg-stone-200 transition-colors"
                      >
                        <ChevronLeft size={15} /> Back
                      </button>
                    )}
                    <button
                      onClick={() => setStep(STEPS[stepIdx + 1])}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-400 transition-colors"
                    >
                      {stepIdx === STEPS.length - 2 ? 'View Summary' : 'Continue'}
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
