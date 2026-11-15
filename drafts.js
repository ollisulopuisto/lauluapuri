// Draft history: the last MAX_DRAFTS texts, newest first, in localStorage.
// A corrupt entry or a full quota must never stop the editor from starting.
export const DRAFTS_KEY = 'lauluapuri-drafts';
export const MAX_DRAFTS = 50;

export function readDrafts(storage) {
    try {
        const parsed = JSON.parse(storage.getItem(DRAFTS_KEY) || '[]');
        if (!Array.isArray(parsed)) return [];
        return parsed.filter((d) => d && typeof d.text === 'string' && Number.isFinite(d.t));
    } catch {
        return [];
    }
}

// Keeps `text` as the newest draft unless it is blank or equals the newest one.
// Returns the drafts as stored; on a failed write, the drafts as they were.
export function saveDraft(storage, text, now = Date.now()) {
    const drafts = readDrafts(storage);
    if (!text.trim() || (drafts.length && drafts[0].text === text)) return drafts;
    const next = [{ t: now, text }, ...drafts].slice(0, MAX_DRAFTS);
    try {
        storage.setItem(DRAFTS_KEY, JSON.stringify(next));
    } catch {
        return drafts;
    }
    return next;
}
