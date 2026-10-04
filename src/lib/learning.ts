export interface LearningState { saved: string[]; read: string[]; notes: Record<string, string> }
const KEY = 'pantheon-learning-v1';
let fallback: LearningState = { saved: [], read: [], notes: {} };
export function getLearning(): LearningState {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    const strings = (v: unknown): string[] => Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
    fallback = { saved: strings(raw.saved), read: strings(raw.read), notes: Object.fromEntries(Object.entries(raw.notes || {}).filter(([, v]) => typeof v === 'string')) as Record<string, string> };
  } catch { /* Storage may be blocked or contain invalid data. */ }
  return fallback;
}
export function saveLearning(state: LearningState): boolean {
  fallback = state;
  let persisted = true;
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { persisted = false; }
  window.dispatchEvent(new CustomEvent('learning-change'));
  return persisted;
}
export function toggleLearning(kind: 'saved' | 'read', id: string): boolean {
  const state = getLearning();
  state[kind] = state[kind].includes(id) ? state[kind].filter(x => x !== id) : [...state[kind], id];
  return saveLearning(state);
}
