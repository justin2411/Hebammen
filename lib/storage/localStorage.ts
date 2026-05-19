import type { Beratung, BeratungAdapter } from './types';

const KEY = 'hebammen-vorsorge:beratungen';

function readAll(): Beratung[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Beratung[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(list: Beratung[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
}

function uid() {
  return `b_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export const localStorageAdapter: BeratungAdapter = {
  async list() {
    return readAll().sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  },

  async get(id) {
    return readAll().find((b) => b.id === id) ?? null;
  },

  async create(input) {
    const now = new Date().toISOString();
    const beratung: Beratung = {
      ...input,
      id: uid(),
      createdAt: now,
      updatedAt: now,
    };
    writeAll([beratung, ...readAll()]);
    return beratung;
  },

  async update(id, patch) {
    const list = readAll();
    const idx = list.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error(`Beratung ${id} nicht gefunden`);
    const updated: Beratung = {
      ...list[idx],
      ...patch,
      id: list[idx].id,
      createdAt: list[idx].createdAt,
      updatedAt: new Date().toISOString(),
    };
    list[idx] = updated;
    writeAll(list);
    return updated;
  },

  async remove(id) {
    writeAll(readAll().filter((b) => b.id !== id));
  },
};
