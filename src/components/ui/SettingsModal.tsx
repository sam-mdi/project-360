import React from 'react';
import { Modal } from './Modal';
import { useSettings } from '../../stores/useSettings';
import { Button } from './Button';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';
import type { AccentColor, NotificationSound } from '../../lib/types';
import { SOUND_OPTIONS, SOUND_LABELS } from '../../lib/sounds';
import { Eye, EyeOff } from 'lucide-react';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const settings = useSettings();
  const [confirmClear, setConfirmClear] = React.useState(false);
  const [showKey, setShowKey] = React.useState(false);

  const handleClearData = () => {
    if (!confirmClear) { setConfirmClear(true); return; }
    localStorage.clear();
    window.location.reload();
  };

  const requestNotifications = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        settings.update({ notificationsEnabled: true });
        toast.success('Notifications enabled!');
      } else {
        toast.error('Notification permission denied');
      }
    }
  };

  const ACCENTS: { value: AccentColor; label: string; color: string }[] = [
    { value: 'amber', label: 'Amber', color: '#f59e0b' },
    { value: 'teal', label: 'Teal', color: '#14b8a6' },
    { value: 'violet', label: 'Violet', color: '#7c3aed' },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Settings">
      <div className="px-5 py-4 space-y-5">
        {/* Name */}
        <div>
          <label className="text-sm font-semibold text-stone-700 block mb-1.5">Your Name</label>
          <input
            className="w-full px-3 py-2.5 rounded-xl bg-stone-100 text-stone-900 font-medium outline-none focus:ring-2 focus:ring-amber-400 text-sm"
            value={settings.firstName}
            onChange={(e) => settings.update({ firstName: e.target.value })}
            placeholder="What should we call you?"
          />
        </div>

        {/* Accent color */}
        <div>
          <label className="text-sm font-semibold text-stone-700 block mb-2">Accent Color</label>
          <div className="flex gap-3">
            {ACCENTS.map(({ value, label, color }) => (
              <button
                key={value}
                onClick={() => settings.update({ accentColor: value })}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all text-sm font-semibold',
                  settings.accentColor === value
                    ? 'border-stone-400 bg-stone-50'
                    : 'border-transparent bg-stone-100 hover:bg-stone-200'
                )}
              >
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div>
          <label className="text-sm font-semibold text-stone-700 block mb-1.5">Notifications</label>
          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
            <span className="text-sm text-stone-600">Enable block reminders</span>
            <button
              onClick={() => {
                if (!settings.notificationsEnabled) requestNotifications();
                else settings.update({ notificationsEnabled: false });
              }}
              className={cn(
                'w-10 h-6 rounded-full transition-colors relative',
                settings.notificationsEnabled ? 'bg-amber-500' : 'bg-stone-300'
              )}
            >
              <div className={cn(
                'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                settings.notificationsEnabled ? 'left-[calc(100%-1.375rem)]' : 'left-0.5'
              )} />
            </button>
          </div>
        </div>

        {/* Default sound */}
        <div>
          <label className="text-sm font-semibold text-stone-700 block mb-1.5">Default Sound</label>
          <select
            className="w-full px-3 py-2.5 rounded-xl bg-stone-100 text-stone-900 text-sm outline-none"
            value={settings.defaultSound}
            onChange={(e) => settings.update({ defaultSound: e.target.value as NotificationSound })}
          >
            {SOUND_OPTIONS.map((s) => (
              <option key={s} value={s}>{SOUND_LABELS[s].label}</option>
            ))}
          </select>
        </div>

        {/* Dark mode */}
        <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
          <span className="text-sm text-stone-600">Dark Mode</span>
          <button
            onClick={() => {
              const next = settings.theme === 'dark' ? 'light' : 'dark';
              settings.update({ theme: next });
              if (next === 'dark') document.documentElement.classList.add('dark');
              else document.documentElement.classList.remove('dark');
            }}
            className={cn(
              'w-10 h-6 rounded-full transition-colors relative',
              settings.theme === 'dark' ? 'bg-amber-500' : 'bg-stone-300'
            )}
          >
            <div className={cn(
              'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
              settings.theme === 'dark' ? 'left-[calc(100%-1.375rem)]' : 'left-0.5'
            )} />
          </button>
        </div>

        {/* Claude API Key */}
        <div>
          <label className="text-sm font-semibold text-stone-700 block mb-1.5">Claude API Key</label>
          <p className="text-xs text-stone-400 mb-2">Powers AI briefings and AI schedule builder. Stored locally only.</p>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              className="w-full px-3 py-2.5 pr-10 rounded-xl bg-stone-100 text-stone-900 font-mono text-xs outline-none focus:ring-2 focus:ring-amber-400"
              value={settings.claudeApiKey}
              onChange={(e) => settings.update({ claudeApiKey: e.target.value })}
              placeholder="sk-ant-api03-…"
            />
            <button
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Pomodoro settings */}
        <div>
          <label className="text-sm font-semibold text-stone-700 block mb-2">Pomodoro Timer</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { key: 'pomodoroWork', label: 'Work' },
              { key: 'pomodoroShortBreak', label: 'Short' },
              { key: 'pomodoroLongBreak', label: 'Long' },
            ] as const).map(({ key, label }) => (
              <div key={key} className="bg-stone-50 rounded-xl p-2.5 text-center">
                <p className="text-xs text-stone-500 mb-1">{label}</p>
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={settings[key]}
                  onChange={(e) => settings.update({ [key]: Number(e.target.value) })}
                  className="w-full text-center font-bold text-stone-900 bg-transparent text-lg outline-none"
                />
                <p className="text-xs text-stone-400">min</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl mt-2">
            <span className="text-sm text-stone-600">Auto-start next session</span>
            <button
              onClick={() => settings.update({ pomodoroAutoStart: !settings.pomodoroAutoStart })}
              className={cn(
                'w-10 h-6 rounded-full transition-colors relative',
                settings.pomodoroAutoStart ? 'bg-amber-500' : 'bg-stone-300'
              )}
            >
              <div className={cn(
                'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                settings.pomodoroAutoStart ? 'left-[calc(100%-1.375rem)]' : 'left-0.5'
              )} />
            </button>
          </div>
        </div>

        {/* Water & Steps Goals */}
        <div>
          <label className="text-sm font-semibold text-stone-700 block mb-2">Daily Goals</label>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-stone-50 rounded-xl p-2.5">
              <p className="text-xs text-stone-500 mb-1">💧 Water (glasses)</p>
              <input
                type="number"
                min={1}
                max={20}
                value={settings.waterGoal}
                onChange={(e) => settings.update({ waterGoal: Number(e.target.value) })}
                className="w-full font-bold text-stone-900 bg-transparent text-lg outline-none"
              />
            </div>
            <div className="bg-stone-50 rounded-xl p-2.5">
              <p className="text-xs text-stone-500 mb-1">👟 Steps</p>
              <input
                type="number"
                min={1000}
                max={50000}
                step={500}
                value={settings.stepsGoal}
                onChange={(e) => settings.update({ stepsGoal: Number(e.target.value) })}
                className="w-full font-bold text-stone-900 bg-transparent text-lg outline-none"
              />
            </div>
          </div>
        </div>

        {/* Show completed */}
        <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
          <span className="text-sm text-stone-600">Show completed blocks</span>
          <button
            onClick={() => settings.update({ showCompletedBlocks: !settings.showCompletedBlocks })}
            className={cn(
              'w-10 h-6 rounded-full transition-colors relative',
              settings.showCompletedBlocks ? 'bg-amber-500' : 'bg-stone-300'
            )}
          >
            <div className={cn(
              'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
              settings.showCompletedBlocks ? 'left-[calc(100%-1.375rem)]' : 'left-0.5'
            )} />
          </button>
        </div>

        {/* Clear data */}
        <div className="pt-2 border-t border-stone-100">
          <Button
            variant={confirmClear ? 'danger' : 'outline'}
            className="w-full"
            onClick={handleClearData}
          >
            {confirmClear ? 'Tap again to confirm — this cannot be undone' : 'Clear All Data'}
          </Button>
          {confirmClear && (
            <button onClick={() => setConfirmClear(false)} className="w-full text-center text-xs text-stone-400 mt-1 py-1">
              Cancel
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
