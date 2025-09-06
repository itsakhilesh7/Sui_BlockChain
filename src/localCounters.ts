// src/localCounters.ts
export type StoredCounter = {
  id: string;
  name?: string;
  isPublic?: boolean;
  createdAt?: string;
};

const keyForAddress = (address?: string) => `distributed-counters:${address ?? 'anon'}`;

export function getCountersForAddress(address?: string): StoredCounter[] {
  if (!address) return [];
  const raw = localStorage.getItem(keyForAddress(address));
  try {
    return raw ? (JSON.parse(raw) as StoredCounter[]) : [];
  } catch {
    return [];
  }
}

export function setCountersForAddress(address: string, counters: StoredCounter[]) {
  localStorage.setItem(keyForAddress(address), JSON.stringify(counters));
}

export function addCounterForAddress(address: string, counter: StoredCounter) {
  const arr = getCountersForAddress(address);
  arr.unshift(counter); // newest first
  setCountersForAddress(address, arr);
}

export function updateCounterForAddress(address: string, id: string, patch: Partial<StoredCounter>) {
  const arr = getCountersForAddress(address).map(c => (c.id === id ? { ...c, ...patch } : c));
  setCountersForAddress(address, arr);
}

export function removeCounterForAddress(address: string, id: string) {
  const arr = getCountersForAddress(address).filter(c => c.id !== id);
  setCountersForAddress(address, arr);
}
