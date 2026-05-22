import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Timeline } from '../components/routine/Timeline';
import { BlockOptionsPanel } from '../components/routine/BlockOptionsPanel';
import { AddBlockWizard } from '../components/routine/AddBlockWizard';
import { SequenceEditor } from '../components/routine/SequenceEditor';
import { Modal } from '../components/ui/Modal';
import { useTimeBlocks } from '../hooks/useTimeBlocks';
import { useRoutine } from '../stores/useRoutine';
import { todayStr } from '../lib/utils';
import { cn } from '../lib/utils';
import { getColor } from '../lib/colors';

type SubTab = 'me' | 'plans' | 'reality';

export function RoutinePage() {
  const [subTab, setSubTab] = useState<SubTab>('me');
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [showSequenceEditor, setShowSequenceEditor] = useState(false);

  const { selectBlock, selectedBlockId, blocks, sequences, addBlock, removeBlock, addSequence } = useRoutine();
  const timeBlocks = useTimeBlocks();
  const selectedBlock = blocks.find((b) => b.id === selectedBlockId) ?? null;
  const today = todayStr();

  const tabs: { id: SubTab; label: string }[] = [
    { id: 'me', label: 'Me' },
    { id: 'plans', label: 'Plans' },
    { id: 'reality', label: 'Reality' },
  ];

  return (
    <div className="flex flex-col h-full relative">
      {/* Sub-tabs */}
      <div className="flex items-center justify-center py-3 border-b border-stone-100 bg-white">
        <div className="flex gap-1 p-1 bg-stone-100 rounded-full">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setSubTab(id)}
              className={cn(
                'px-5 py-1.5 rounded-full text-sm font-semibold transition-all',
                subTab === id
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {subTab === 'me' && (
            <motion.div
              key="me"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="pb-24"
            >
              <Timeline
                blocks={timeBlocks}
                onBlockClick={(id) => selectBlock(id === selectedBlockId ? null : id)}
                selectedId={selectedBlockId}
                date={today}
              />
            </motion.div>
          )}

          {subTab === 'plans' && (
            <motion.div
              key="plans"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-stone-800">Sequences</h2>
                <button
                  onClick={() => setShowSequenceEditor(true)}
                  className="flex items-center gap-1.5 text-sm text-amber-600 font-semibold hover:text-amber-700"
                >
                  <Plus size={14} /> New
                </button>
              </div>
              {sequences.length === 0 && (
                <div className="text-center py-12 text-stone-400">
                  <p className="text-sm">No sequences yet</p>
                  <p className="text-xs mt-1">Create a sequence to reuse blocks across days</p>
                </div>
              )}
              <div className="space-y-3">
                {sequences.map((seq) => {
                  const seqBlocks = seq.blockIds.map((id) => blocks.find((b) => b.id === id)).filter(Boolean);
                  const totalDuration = seqBlocks.reduce((sum, b) => sum + (b?.duration ?? 0), 0);
                  return (
                    <div key={seq.id} className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-stone-900">{seq.name}</h3>
                        <span className="text-xs text-stone-400 font-medium">
                          {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {seqBlocks.map((b) => {
                          if (!b) return null;
                          const c = getColor(b.color);
                          return (
                            <div
                              key={b.id}
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                              style={{ backgroundColor: c.light, color: c.bg }}
                            >
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.bg }} />
                              {b.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {subTab === 'reality' && (
            <motion.div
              key="reality"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="p-4"
            >
              <h2 className="text-base font-bold text-stone-800 mb-4">Today's Reality Check</h2>
              {timeBlocks.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-sm">No blocks to compare</div>
              ) : (
                <div className="space-y-3">
                  {timeBlocks.map((block) => {
                    const c = getColor(block.color);
                    const { getActualsForDate } = useRoutine.getState();
                    const actual = getActualsForDate(today).find((a) => a.blockId === block.id);
                    const actualDur = actual?.startedAt && actual?.endedAt
                      ? Math.round((new Date(actual.endedAt).getTime() - new Date(actual.startedAt).getTime()) / 60000)
                      : null;
                    const diff = actualDur ? actualDur - block.duration : null;
                    const status = diff === null ? 'pending' : diff > 5 ? 'late' : diff < -5 ? 'early' : 'ontime';

                    return (
                      <div key={block.id} className="bg-white rounded-2xl border border-stone-100 p-4 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-3 h-8 rounded-full" style={{ backgroundColor: c.bg }} />
                          <div>
                            <p className="font-bold text-stone-900 text-sm">{block.label}</p>
                            <p className="text-xs text-stone-400">Planned: {block.duration}m</p>
                          </div>
                          {status !== 'pending' && (
                            <span className={cn(
                              'ml-auto text-xs font-bold px-2 py-0.5 rounded-full',
                              status === 'ontime' ? 'bg-emerald-100 text-emerald-700' :
                              status === 'early' ? 'bg-amber-100 text-amber-700' :
                              'bg-rose-100 text-rose-600'
                            )}>
                              {status === 'ontime' ? 'On track' : status === 'early' ? `${Math.abs(diff!)}m early` : `${diff}m over`}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <div className="flex-1">
                            <p className="text-xs text-stone-400 mb-1">Planned</p>
                            <div className="h-4 rounded-full bg-stone-100 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: '100%', backgroundColor: c.bg, opacity: 0.3 }} />
                            </div>
                            <p className="text-xs text-stone-500 mt-0.5 text-right">{block.duration}m</p>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-stone-400 mb-1">Actual</p>
                            <div className="h-4 rounded-full bg-stone-100 overflow-hidden">
                              {actualDur !== null && (
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${Math.min(100, (actualDur / block.duration) * 100)}%`,
                                    backgroundColor: status === 'ontime' ? '#10b981' : status === 'early' ? '#f59e0b' : '#ef4444',
                                  }}
                                />
                              )}
                            </div>
                            <p className="text-xs text-stone-500 mt-0.5 text-right">
                              {actualDur !== null ? `${actualDur}m` : '—'}
                            </p>
                          </div>
                        </div>

                        {actual?.notes !== 'skipped' && !actual?.startedAt && (
                          <button
                            onClick={() => {
                              const { logActual } = useRoutine.getState();
                              logActual(today, { blockId: block.id, startedAt: new Date().toISOString() });
                            }}
                            className="mt-2 w-full py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                          >
                            ▶ Start
                          </button>
                        )}
                        {actual?.startedAt && !actual?.endedAt && (
                          <button
                            onClick={() => {
                              const { logActual } = useRoutine.getState();
                              logActual(today, { blockId: block.id, startedAt: actual.startedAt, endedAt: new Date().toISOString() });
                            }}
                            className="mt-2 w-full py-1.5 text-xs font-semibold rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                          >
                            ■ Done
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FAB */}
      {subTab === 'me' && (
        <button
          onClick={() => setShowAddWizard(true)}
          className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 text-white shadow-xl flex items-center justify-center transition-all active:scale-90"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Block options */}
      <BlockOptionsPanel
        block={selectedBlock}
        onClose={() => selectBlock(null)}
        onSkip={() => { if (selectedBlockId) { useRoutine.getState().skipBlock(selectedBlockId, today); selectBlock(null); } }}
        onEdit={() => { selectBlock(null); setShowAddWizard(true); }}
        onDelete={() => { if (selectedBlockId) { removeBlock(selectedBlockId); selectBlock(null); } }}
        onViewPlan={() => setSubTab('plans')}
      />

      {/* Add block modal */}
      <Modal open={showAddWizard} onClose={() => setShowAddWizard(false)} fullScreen>
        <AddBlockWizard
          onSave={(block) => { addBlock(block); setShowAddWizard(false); }}
          onCancel={() => setShowAddWizard(false)}
          initial={selectedBlockId ? blocks.find((b) => b.id === selectedBlockId) : undefined}
        />
      </Modal>

      {/* Sequence editor modal */}
      <Modal open={showSequenceEditor} onClose={() => setShowSequenceEditor(false)} fullScreen>
        <SequenceEditor
          onSave={(seq) => { addSequence(seq); setShowSequenceEditor(false); }}
          onCancel={() => setShowSequenceEditor(false)}
        />
      </Modal>
    </div>
  );
}
