# Project 360

A production-grade daily routine and life planning tracker — inspired by Routinery, built with React + Vite + TypeScript.

## Setup

```bash
npm install
npm run dev
# Open http://localhost:5173
```

## Tech Stack

| Library | Purpose |
|---------|---------|
| React 19 + Vite + TypeScript | Core framework |
| Tailwind CSS v4 + @tailwindcss/vite | Styling |
| Zustand | State management (5 stores) |
| date-fns | Date manipulation |
| Recharts | BarChart, DonutChart, RadarChart |
| Lucide React | 80+ categorized icons |
| Framer Motion | Tab transitions, panel animations |
| @dnd-kit | Drag-and-drop timeline reordering |
| react-datepicker | Date range picker in Plan setup |
| react-hot-toast | Notifications |
| react-hook-form | Schedule event form |
| Howler.js | In-browser notification sounds |
| clsx + tailwind-merge | Class utilities |

All data persists to **localStorage** — no backend required.

## Features

### Tab 1 — Daily Routine
- **Me**: Fluid wavy time-block timeline. Drag to reorder. Active block shows progress bar + "Xm in / Xm left" badges.
- **Plans**: Saved block sequences. Create named groups of blocks with total duration.
- **Reality**: Side-by-side planned vs actual time comparison. Tap Start / Done to log actuals.
- **Add Block Wizard** (FAB +): 6-step flow — Icon → Color → Time (circular clock) → Duration → Sound → Recurrence.
- **Block Options Panel**: Bottom sheet with Notes, Skip, Move, Duration, Reset, Delete, View Plan.

### Tab 2 — Plan
- Create plans with a date range and Wheel of Life baseline (8 life areas, 1–10 sliders + RadarChart).
- Spreadsheet with dates in rows, user-defined columns (toggle 0/1 or notes text).
- Toggle cells green (✓) / red (✗). Week totals auto-calculated.
- Right panel slides in on row click — shows per-topic toggles, notes, and a completion ring.
- Plan switcher dropdown — duplicate, delete, export CSV.

### Tab 3 — Progress
- Streak badge (flame icon + day count).
- Today's donut chart (done vs remaining).
- 7-day bar chart (planned vs done).
- 30-day GitHub-style heatmap.
- Best day / average completion stat tiles.
- Wheel of Life RadarChart (current vs start baseline).
- Per-plan progress bars with Best Topic / Needs Work callouts.

### Tab 4 — Schedule
- Custom monthly calendar grid (no react-big-calendar).
- Colored pill chips for events on each day cell.
- Right panel slides in on day click — add/edit/delete events.
- Event form: title, start/end time, color picker (24 named colors), notes.
- Month navigation with Today button.

### Sidebar
- Dark slate, 240px expanded / 64px collapsed.
- Amber-500 active nav item.
- Good morning/afternoon/evening greeting.
- Gear icon → Settings modal.

### Settings Modal
- First name (used in greeting).
- Accent color: Amber / Teal / Violet.
- Browser notification toggle.
- Default notification sound.
- Show/hide completed blocks toggle.
- Clear All Data (double-confirm).

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `T` | Go to Routine tab |
| `⌘K` / `Ctrl+K` | Open command palette |
| `Esc` | Close modals/panels |

### Sounds
12 notification sounds (Ding, Chime, Bell, Piano, Alarm 80s, etc.) synthesized via Howler.js Web Audio. Each block has its own sound. Preview by clicking Play in the picker.

## Folder Structure

```
src/
  stores/         useSettings, useRoutine, usePlans, useSchedule, useTasks
  hooks/          useTimeBlocks, useStreak, useKeyboard, useNotifications
  lib/            types.ts, utils.ts, colors.ts, sounds.ts
  components/
    ui/            Button, Modal, Badge, ProgressBar, InlineEdit, WavyBlock,
                   CircularTimePicker, IconPicker, ColorPicker, SoundPicker,
                   SettingsModal, WelcomeModal, CommandPalette
    routine/       Timeline, BlockOptionsPanel, AddBlockWizard, SequenceEditor
    plan/          PlanSheet, PlanSwitcher
    progress/      HeatMap, WheelOfLife, StreakBadge
    schedule/      CalendarGrid, DayPanel
  pages/           RoutinePage, PlanPage, ProgressPage, SchedulePage
  App.tsx          Sidebar, routing, error boundaries, global modals
```
