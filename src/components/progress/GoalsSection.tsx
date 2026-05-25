import { useState } from 'react';
import { useGoals } from '../../stores/useGoals';
import { useSettings } from '../../stores/useSettings';
import { callClaudeJSON } from '../../lib/ai';
import { Target, Plus, Sparkles, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import type { Milestone } from '../../stores/useGoals';
import { cn } from '../../lib/utils';

const SYSTEM = `You are a goal-setting coach. The user has an annual goal. Break it into 3-4 specific, measurable 90-day milestones.
Return a JSON array with this shape: [{ "label": string, "target": "YYYY-MM-DD" }]
Space the milestones roughly quarterly from today. Return ONLY valid JSON array.`;

export function GoalsSection() {
  const { annualGoal, milestones, currentWeekIntention, setAnnualGoal, setWeekIntention, addMilestone, updateMilestone, removeMilestone, setMilestonesFromAI } = useGoals();
  const { claudeApiKey } = useSettings();

  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState(annualGoal);
  const [generating, setGenerating] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [newLabel, setNewLabel] = useState('');
  const [newTarget, setNewTarget] = useState('');

  const generateMilestones = async () => {
    if (!claudeApiKey || !annualGoal) return;
    setGenerating(true);
    try {
      const raw = await callClaudeJSON<{ label: string; target: string }[]>(
        claudeApiKey,
        SYSTEM,
        `My annual goal: ${annualGoal}. Today is ${new Date().toISOString().slice(0, 10)}.`,
        400
      );
      setMilestonesFromAI(raw.map((m) => ({
        label: m.label,
        target: m.target,
        progress: 0,
        weeklyIntentions: [],
      })));
    } catch (_) {}
    setGenerating(false);
  };

  if (!annualGoal && !editingGoal) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
        <div className="flex items-center gap-2 mb-3">
          <Target size={16} className="text-amber-500" />
          <h2 className="text-sm font-bold text-stone-700">Annual Goal</h2>
        </div>
        <p className="text-sm text-stone-400 mb-3">Set your big goal for the year and track quarterly milestones.</p>
        <button
          onClick={() => setEditingGoal(true)}
          className="w-full py-2.5 rounded-2xl bg-amber-50 text-amber-600 text-sm font-semibold hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Set Annual Goal
        </button>
      </div>
    );
  }

  if (editingGoal) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
        <h2 className="text-sm font-bold text-stone-700 mb-3">Set Your Annual Goal</h2>
        <textarea
          autoFocus
          value={goalDraft}
          onChange={(e) => setGoalDraft(e.target.value)}
          placeholder="e.g. Build and launch my SaaS product with 100 paying customers"
          rows={3}
          className="w-full px-3 py-2 rounded-xl bg-stone-100 text-sm outline-none focus:ring-2 focus:ring-amber-300 resize-none mb-3"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setEditingGoal(false)}
            className="flex-1 py-2 rounded-xl bg-stone-100 text-stone-600 text-sm font-semibold hover:bg-stone-200"
          >
            Cancel
          </button>
          <button
            onClick={() => { setAnnualGoal(goalDraft); setEditingGoal(false); }}
            disabled={!goalDraft.trim()}
            className="flex-1 py-2 rounded-xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-400 disabled:opacity-40"
          >
            Save Goal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center justify-between w-full mb-3"
      >
        <div className="flex items-center gap-2">
          <Target size={16} className="text-amber-500" />
          <h2 className="text-sm font-bold text-stone-700">Annual Goal</h2>
        </div>
        {expanded ? <ChevronUp size={14} className="text-stone-400" /> : <ChevronDown size={14} className="text-stone-400" />}
      </button>

      {expanded && (
        <>
          <div className="bg-amber-50 rounded-xl p-3 mb-4">
            <p className="text-sm font-semibold text-stone-800">{annualGoal}</p>
            <button onClick={() => { setGoalDraft(annualGoal); setEditingGoal(true); }} className="text-xs text-amber-600 mt-1 hover:text-amber-700">Edit</button>
          </div>

          {/* Milestones */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-stone-500 uppercase tracking-wide">90-Day Milestones</p>
              {claudeApiKey && (
                <button
                  onClick={generateMilestones}
                  disabled={generating}
                  className="flex items-center gap-1 text-xs text-amber-600 font-semibold hover:text-amber-700 disabled:opacity-40"
                >
                  <Sparkles size={11} />
                  {generating ? 'Generating…' : 'AI Generate'}
                </button>
              )}
            </div>

            <div className="space-y-2">
              {milestones.map((m) => (
                <MilestoneRow key={m.id} milestone={m} onUpdate={updateMilestone} onRemove={removeMilestone} />
              ))}
            </div>

            {/* Add milestone */}
            <div className="flex gap-2 mt-2">
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Milestone label"
                className="flex-1 px-2.5 py-1.5 rounded-xl bg-stone-100 text-xs outline-none focus:ring-2 focus:ring-amber-300"
              />
              <input
                type="date"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-stone-100 text-xs outline-none focus:ring-2 focus:ring-amber-300"
              />
              <button
                onClick={() => { if (newLabel && newTarget) { addMilestone(newLabel, newTarget); setNewLabel(''); setNewTarget(''); } }}
                disabled={!newLabel || !newTarget}
                className="p-1.5 rounded-xl bg-amber-500 text-white hover:bg-amber-400 disabled:opacity-40 transition-colors"
              >
                <Plus size={13} />
              </button>
            </div>
          </div>

          {/* This week's intention */}
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">This Week's Intention</p>
            <textarea
              value={currentWeekIntention}
              onChange={(e) => setWeekIntention(e.target.value)}
              placeholder="What's your #1 focus this week?"
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-stone-100 text-xs outline-none focus:ring-2 focus:ring-amber-300 resize-none"
            />
          </div>
        </>
      )}
    </div>
  );
}

function MilestoneRow({ milestone, onUpdate, onRemove }: {
  milestone: Milestone;
  onUpdate: (id: string, patch: Partial<Milestone>) => void;
  onRemove: (id: string) => void;
}) {
  const pct = Math.round(milestone.progress * 100);
  const daysLeft = Math.ceil((new Date(milestone.target).getTime() - Date.now()) / 86400000);

  return (
    <div className="bg-stone-50 rounded-xl p-2.5">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="text-xs font-semibold text-stone-800 flex-1">{milestone.label}</p>
        <button onClick={() => onRemove(milestone.id)} className="text-stone-300 hover:text-rose-400 transition-colors">
          <Trash2 size={11} />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-stone-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={pct}
          onChange={(e) => onUpdate(milestone.id, { progress: Number(e.target.value) / 100 })}
          className="w-16"
        />
        <span className="text-xs font-bold text-amber-600 w-8">{pct}%</span>
      </div>
      <p className={cn(
        'text-[10px] mt-1',
        daysLeft < 0 ? 'text-rose-400' : daysLeft < 14 ? 'text-amber-500' : 'text-stone-400'
      )}>
        {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today!' : `${daysLeft}d left · ${milestone.target}`}
      </p>
    </div>
  );
}
