const QUEUE_KEY = 'sunubudget_pending_sync';

export type PendingSyncEnvelope = {
  pending_sync: true;
  ts: number;
  table: string;
  op: string;
  payload: unknown;
};

export function enqueueOfflineOperation(table: string, op: string, payload: unknown): void {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    const queue: PendingSyncEnvelope[] = raw ? JSON.parse(raw) : [];
    queue.push({ pending_sync: true, ts: Date.now(), table, op, payload });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-200)));
  } catch {
    /* ignore quota / private mode */
  }
}

export function peekOfflineQueue(): PendingSyncEnvelope[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearOfflineQueue(): void {
  try {
    localStorage.removeItem(QUEUE_KEY);
  } catch {
    /* ignore */
  }
}
