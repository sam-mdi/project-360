export type AccentColor = 'amber' | 'teal' | 'violet';

export type BlockColor =
  | 'watermelon' | 'strawberry' | 'rust' | 'salmon' | 'mandarin'
  | 'pumpkin' | 'apricot' | 'honey' | 'mustard' | 'butter'
  | 'lime' | 'sage' | 'teal' | 'sky' | 'periwinkle'
  | 'lavender' | 'amethyst' | 'lilac' | 'orchid' | 'fuchsia'
  | 'carnation' | 'ultra' | 'slate' | 'stone';

export type NotificationSound =
  | 'none' | 'vibrate' | 'system' | 'alarm80s' | 'airhorn'
  | 'angklung' | 'whistle' | 'boing' | 'ding' | 'chime' | 'bell' | 'piano';

export type RecurrenceType = 'daily' | 'weekly' | 'custom';

export type EnergyLevel = 'high' | 'medium' | 'low';

export interface TimeBlock {
  id: string;
  label: string;
  icon: string;
  color: BlockColor;
  startTime: string; // "HH:MM"
  duration: number;  // minutes
  sound: NotificationSound;
  recurrence: {
    type: RecurrenceType;
    days?: number[]; // 0=Sun...6=Sat
    every?: number;
  };
  sequenceId?: string;
  notes?: string;
  skipped?: boolean;
  energyLevel?: EnergyLevel;
}

export interface ActualBlock {
  blockId: string;
  date: string; // YYYY-MM-DD
  startedAt?: string; // ISO timestamp
  endedAt?: string;
  notes?: string;
}

export interface Sequence {
  id: string;
  name: string;
  blockIds: string[];
  color: BlockColor;
}

export interface DailyRoutine {
  date: string; // YYYY-MM-DD
  blockIds: string[];
  actuals: ActualBlock[];
}

// Plans
export type ColumnType = 'toggle' | 'notes';

export interface PlanColumn {
  id: string;
  label: string;
  type: ColumnType;
  width?: number; // px
}

export interface PlanRow {
  date: string; // YYYY-MM-DD
  values: Record<string, string | number>;
}

export interface WheelOfLifeValues {
  health: number;
  career: number;
  money: number;
  love: number;
  family: number;
  friends: number;
  fun: number;
  spirituality: number;
}

export interface Plan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  columns: PlanColumn[];
  rows: PlanRow[];
  wheelStart?: WheelOfLifeValues;
  wheelCurrent?: WheelOfLifeValues;
}

// Schedule
export interface ScheduleEvent {
  id: string;
  title: string;
  icon: string;
  color: BlockColor;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  sound: NotificationSound;
  notes?: string;
}

// History
export interface HistoryEntry {
  date: string;
  blocks: TimeBlock[];
  actuals: ActualBlock[];
  completionRate: number;
}

// Notes
export interface Note {
  id: string;
  title: string;
  content: string; // HTML
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  color: string;
}

// Settings
export interface Settings {
  firstName: string;
  accentColor: AccentColor;
  notificationsEnabled: boolean;
  defaultSound: NotificationSound;
  showCompletedBlocks: boolean;
  theme: 'light' | 'dark';
  claudeApiKey: string;
  onboardingComplete: boolean;
  pomodoroWork: number;
  pomodoroShortBreak: number;
  pomodoroLongBreak: number;
  pomodoroAutoStart: boolean;
  waterGoal: number;
  stepsGoal: number;
}
