import { useState } from 'react';
import { Wand2, X, Plus, Trash2 } from 'lucide-react';
import { useSettings } from '../../stores/useSettings';
import { useRoutine } from '../../stores/useRoutine';
import { callClaudeJSON } from '../../lib/ai';
import type { TimeBlock, BlockColor } from '../../lib/types';
import { generateId } from '../../lib/utils';
import { cn } from '../../lib/utils';

const SYSTEM = `You are a scheduling assistant for a productivity app called Project 360.
The user will describe their day or a list of activities. Parse them into time blocks.
Return a JSON array of blocks with this exact shape:
[{ "label": string, "icon": string, "color": string, "startTime": "HH:MM", "duration": number }]
- icon: a single emoji (e.g. "🏃", "📚", "💻", "🍳", "🧘")
- color: one of: watermelon, strawberry, rust, salmon, mandarin, pumpkin, apricot, honey, mustard, butter, lime, sage, teal, sky, periwinkle, lavender, amethyst, lilac, orchid, fuchsia, carnation, ultra, slate, stone
- startTime: 24h format "HH:MM"
- duration: number in minutes
Return ONLY valid JSON array, no markdown, no explanation.`;

interface ParsedBlock {
  label: string;
  icon: string;
  color: BlockColor;
  startTime: string;
  duration: number;
}

interface AIScheduleModalProps {
  onClose: () => void;
}

const VALID_COLORS: BlockColor[] = [
  'watermelon', 'strawberry', 'rust', 'salmon', 'mandarin', 'pumpkin', 'apricot',
  'honey', 'mustard', 'butter', 'lime', 'sage', 'teal', 'sky', 'periwinkle',
  'lavender', 'amethyst', 'lilac', 'orchid', 'fuchsia', 'carnation', 'ultra', 'slate', 'stone',
];

export function AIScheduleModal({ onClose }: AIScheduleModalProps) {
  const { claudeApiKey } = useSettings();
  const { addBlock } = useRoutine();

  const [text, setText] = useState('');
  const [blocks, setBlocks] = useState<ParsedBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const parseBlocks = async () => {
    if (!text.trim()) return;
    if (!claudeApiKey) { setError('Add your Claude API key in Settings first.'); return; }
    setLoading(true);
    setError('');
    try {
      const raw = await callClaudeJSON<ParsedBlock[]>(claudeApiKey, SYSTEM, text, 800);
      const validated = raw.map((b) => ({
        label: String(b.label || 'Block'),
        icon: String(b.icon || '⭐'),
        color: VALID_COLORS.includes(b.color) ? b.color : 'sky' as BlockColor,
        startTime: /^\d{2}:\d{2}$/.test(b.startTime) ? b.startTime : '09:00',
        duration: Math.min(480, Math.max(5, Number(b.duration) || 30)),
      }));
      setBlocks(validated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to parse schedule');
    } finally {
      setLoading(false);
    }
  };

  const addAllToRoutine = () => {
    blocks.forEach((b) => {
      addBlock({
        label: b.label,
        icon: b.icon,
        color: b.color,
        startTime: b.startTime,
        duration: b.duration,
        sound: 'ding',
        recurrence: { type: 'weekly', days: [0,1,2,3,4,5,6] },
        notes: '',
      });
    });
    onClose();
  };

  const removeBlock = (idx: number) => setBlocks((prev) => prev.filter((_, i) => i !== idx));

  const updateBlock = (idx: number, patch: Partial<ParsedBlock>) =>
    setBlocks((prev) => prev.map((b, i) => i === idx ? { ...b, ...patch } : b));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Wand2 size={18} className="text-amber-500" />
            <span className="font-bold text-stone-900">AI Schedule Builder</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {blocks.length === 0 ? (
            <>
              <p className="text-sm text-stone-500">
                Describe your day and AI will generate time blocks for you.
              </p>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={"e.g. Wake up at 6am, 30 min yoga, breakfast for 20 min, deep work 9am-12pm, lunch break 1 hour, meetings 2-4pm, gym at 5pm for 1 hour, dinner at 7pm, reading before bed at 10pm"}
                rows={7}
                className="w-full px-4 py-3 rounded-2xl bg-stone-100 text-sm outline-none focus:ring-2 focus:ring-amber-300 resize-none leading-relaxed"
              />
              {error && <p className="text-xs text-rose-500">{error}</p>}
            </>
          ) : (
            <>
              <p className="text-sm text-stone-500">{blocks.length} blocks generated. Edit or remove as needed.</p>
              <div className="space-y-2">
                {blocks.map((block, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-stone-50 rounded-2xl p-3">
                    <span className="text-2xl">{block.icon}</span>
                    {editingIdx === idx ? (
                      <div className="flex-1 space-y-1.5">
                        <input
                          value={block.label}
                          onChange={(e) => updateBlock(idx, { label: e.target.value })}
                          className="w-full px-2 py-1 rounded-lg bg-white border border-stone-200 text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-300"
                        />
                        <div className="flex gap-2">
                          <input
                            value={block.startTime}
                            onChange={(e) => updateBlock(idx, { startTime: e.target.value })}
                            className="w-24 px-2 py-1 rounded-lg bg-white border border-stone-200 text-xs outline-none focus:ring-2 focus:ring-amber-300"
                            placeholder="HH:MM"
                          />
                          <input
                            type="number"
                            value={block.duration}
                            onChange={(e) => updateBlock(idx, { duration: Number(e.target.value) })}
                            className="w-20 px-2 py-1 rounded-lg bg-white border border-stone-200 text-xs outline-none focus:ring-2 focus:ring-amber-300"
                            min={5}
                            max={480}
                          />
                          <span className="text-xs text-stone-400 self-center">min</span>
                          <button
                            onClick={() => setEditingIdx(null)}
                            className="ml-auto text-xs text-amber-600 font-semibold hover:text-amber-700"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <button
                          onClick={() => setEditingIdx(idx)}
                          className="w-full text-left"
                        >
                          <p className="text-sm font-semibold text-stone-900">{block.label}</p>
                          <p className="text-xs text-stone-400">{block.startTime} · {block.duration}m</p>
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => removeBlock(idx)}
                      className="p-1.5 rounded-xl hover:bg-rose-50 text-stone-300 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setBlocks([])}
                className="text-xs text-stone-400 hover:text-stone-600"
              >
                ← Start over
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 pt-3 border-t border-stone-100 flex gap-3">
          {blocks.length === 0 ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-2xl bg-stone-100 text-stone-600 text-sm font-semibold hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={parseBlocks}
                disabled={loading || !text.trim()}
                className={cn(
                  'flex-1 py-2.5 rounded-2xl text-white text-sm font-bold transition-colors flex items-center justify-center gap-2',
                  loading || !text.trim() ? 'bg-amber-300' : 'bg-amber-500 hover:bg-amber-400'
                )}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Wand2 size={15} />
                    Generate Schedule
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-2xl bg-stone-100 text-stone-600 text-sm font-semibold hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addAllToRoutine}
                disabled={blocks.length === 0}
                className="flex-1 py-2.5 rounded-2xl bg-amber-500 text-white text-sm font-bold hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <Plus size={15} />
                Add {blocks.length} Blocks
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
