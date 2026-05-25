import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';
import { useSettings } from '../../stores/useSettings';
import { cn } from '../../lib/utils';

type Step = 'welcome' | 'name' | 'theme' | 'apikey' | 'done';
const STEPS: Step[] = ['welcome', 'name', 'theme', 'apikey', 'done'];

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { update, firstName } = useSettings();
  const [step, setStep] = useState<Step>('welcome');
  const [name, setName] = useState(firstName === 'Friend' ? '' : firstName);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark'>('light');
  const [apiKey, setApiKey] = useState('');

  const stepIdx = STEPS.indexOf(step);

  const next = () => {
    if (step === 'name') {
      update({ firstName: name.trim() || 'Friend' });
    }
    if (step === 'theme') {
      update({ theme: selectedTheme });
      if (selectedTheme === 'dark') document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
    if (step === 'apikey') {
      if (apiKey.trim()) update({ claudeApiKey: apiKey.trim() });
    }
    if (step === 'done') {
      update({ onboardingComplete: true });
      onComplete();
      return;
    }
    setStep(STEPS[stepIdx + 1]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 pt-8 pb-4">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={cn(
              'rounded-full transition-all',
              i === stepIdx ? 'w-6 h-2 bg-amber-500' : i < stepIdx ? 'w-2 h-2 bg-amber-300' : 'w-2 h-2 bg-stone-200'
            )}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8 max-w-sm mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="w-full text-center"
          >
            {step === 'welcome' && (
              <>
                <div className="w-20 h-20 rounded-3xl bg-amber-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-200">
                  <span className="text-white text-2xl font-extrabold">360</span>
                </div>
                <h1 className="text-3xl font-bold text-stone-900 mb-3">Welcome to Project 360</h1>
                <p className="text-stone-500 text-base leading-relaxed">
                  Your personal productivity command center. Let's get you set up in 60 seconds.
                </p>
              </>
            )}

            {step === 'name' && (
              <>
                <h2 className="text-2xl font-bold text-stone-900 mb-2">What's your name?</h2>
                <p className="text-stone-500 mb-6">We'll personalize your experience</p>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && next()}
                  placeholder="Enter your first name"
                  className="w-full text-center text-xl font-semibold px-4 py-4 rounded-2xl bg-stone-100 outline-none focus:ring-2 focus:ring-amber-400 text-stone-900"
                />
              </>
            )}

            {step === 'theme' && (
              <>
                <h2 className="text-2xl font-bold text-stone-900 mb-2">Choose your theme</h2>
                <p className="text-stone-500 mb-6">You can always change this in Settings</p>
                <div className="flex gap-4">
                  {(['light', 'dark'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTheme(t)}
                      className={cn(
                        'flex-1 rounded-2xl p-4 border-2 transition-all',
                        selectedTheme === t ? 'border-amber-500 bg-amber-50' : 'border-stone-200 bg-white hover:border-stone-300'
                      )}
                    >
                      <div className={cn(
                        'w-full h-16 rounded-xl mb-3 flex items-center justify-center',
                        t === 'light' ? 'bg-stone-100' : 'bg-slate-900'
                      )}>
                        <div className={cn('w-8 h-8 rounded-xl', t === 'light' ? 'bg-amber-500' : 'bg-amber-400')} />
                      </div>
                      <p className="text-sm font-bold text-stone-700 capitalize">{t}</p>
                      {selectedTheme === t && (
                        <div className="mt-1 flex justify-center">
                          <Check size={14} className="text-amber-500" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}

            {step === 'apikey' && (
              <>
                <h2 className="text-2xl font-bold text-stone-900 mb-2">AI Briefings (optional)</h2>
                <p className="text-stone-500 mb-2 text-sm leading-relaxed">
                  Add your Claude API key to unlock personalized morning briefings and AI schedule building.
                </p>
                <a
                  href="https://console.anthropic.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-600 underline mb-4 block"
                >
                  Get a key at console.anthropic.com →
                </a>
                <input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-ant-api03-…"
                  type="password"
                  className="w-full px-4 py-3 rounded-2xl bg-stone-100 text-sm font-mono outline-none focus:ring-2 focus:ring-amber-400"
                />
                <p className="text-xs text-stone-400 mt-2">Stored locally, never sent to our servers</p>
              </>
            )}

            {step === 'done' && (
              <>
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                  <Check size={32} className="text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-stone-900 mb-2">You're all set!</h2>
                <p className="text-stone-500 leading-relaxed">
                  Start by adding your first time block on the Routine tab. Build your perfect day.
                </p>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="px-8 pb-10 max-w-sm mx-auto w-full">
        <button
          onClick={next}
          className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-white font-bold text-base transition-colors flex items-center justify-center gap-2"
        >
          {step === 'done' ? "Let's go!" : step === 'apikey' && !apiKey ? 'Skip for now' : 'Continue'}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
