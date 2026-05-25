import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../lib/utils';

export interface WeeklyReview {
  id: string;
  weekStart: string; // YYYY-MM-DD (Monday)
  wentWell: string;
  improve: string;
  intention: string;
  stats: {
    totalBlocks: number;
    doneBlocks: number;
    daysWithData: number;
    completionRate: number;
  };
  completedAt: string;
}

interface ReviewsStore {
  reviews: WeeklyReview[];
  reviewDismissedWeek: string;
  addReview: (review: Omit<WeeklyReview, 'id' | 'completedAt'>) => string;
  dismissReview: (weekStart: string) => void;
  getReviewForWeek: (weekStart: string) => WeeklyReview | undefined;
}

export const useReviews = create<ReviewsStore>()(
  persist(
    (set, get) => ({
      reviews: [],
      reviewDismissedWeek: '',

      addReview: (review) => {
        const id = generateId();
        set((s) => ({
          reviews: [
            ...s.reviews.filter((r) => r.weekStart !== review.weekStart),
            { ...review, id, completedAt: new Date().toISOString() },
          ],
        }));
        return id;
      },

      dismissReview: (weekStart) => set({ reviewDismissedWeek: weekStart }),

      getReviewForWeek: (weekStart) =>
        get().reviews.find((r) => r.weekStart === weekStart),
    }),
    { name: 'p360-reviews' }
  )
);
