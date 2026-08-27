import { defineStore } from 'pinia';

const STORAGE_KEY = 'dorm_system_seen_tours';

export const useTourStore = defineStore('tour', {
  state: () => ({
    seenTours: JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  }),

  actions: {
    hasSeenTour(tourKey) {
      return !!this.seenTours[tourKey];
    },

    markTourAsSeen(tourKey) {
      this.seenTours[tourKey] = true;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.seenTours));
    },

    resetAllTours() {
      this.seenTours = {};
      localStorage.removeItem(STORAGE_KEY);
    }
  }
});
