import { useState, useEffect, useCallback } from 'react';

const DRAFT_KEY = 'rescueDraft';

const emptyDraft = {
  photos: [],
  location: { lat: null, lng: null, address: '' },
  animalType: '',
  conditions: [],
  urgency: '',
  description: '',
  contactPhone: '',
};

export function useRescueDraft() {
  const [draft, setDraft] = useState(emptyDraft);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // photos can't be restored (File objects), so only flag if other data exists
        if (parsed.animalType || parsed.location?.address || parsed.description) {
          setHasSavedDraft(true);
        }
      } catch {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, []);

  const updateDraft = useCallback((updates) => {
    setDraft((prev) => {
      const next = { ...prev, ...updates };
      const toSave = { ...next, photos: [] }; // don't persist File objects
      localStorage.setItem(DRAFT_KEY, JSON.stringify(toSave));
      return next;
    });
  }, []);

  const restoreDraft = useCallback(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        setDraft({ ...JSON.parse(saved), photos: [] });
      } catch {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
    setHasSavedDraft(false);
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    setDraft(emptyDraft);
    setHasSavedDraft(false);
  }, []);

  return { draft, updateDraft, restoreDraft, clearDraft, hasSavedDraft };
}