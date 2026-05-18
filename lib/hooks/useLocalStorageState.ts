'use client';

import { useCallback, useSyncExternalStore } from 'react';

const SUBSCRIBERS: Record<string, Set<() => void>> = {};

function getSubs(key: string): Set<() => void> {
  if (!SUBSCRIBERS[key]) SUBSCRIBERS[key] = new Set();
  return SUBSCRIBERS[key];
}

function notify(key: string) {
  getSubs(key).forEach((cb) => cb());
}

/**
 * useState-Variante, die ihren Wert in localStorage persistiert.
 *
 * Implementiert über useSyncExternalStore — single source of truth ist
 * localStorage selbst, kein zusätzlicher useState im React-Land.
 * Vermeidet damit react-hooks/set-state-in-effect.
 *
 * Synchronisiert auch zwischen Tabs (storage-Event) und innerhalb
 * desselben Tabs (internes Subscriber-Register).
 */
export function useLocalStorageState<T>(
  key: string,
  initial: T,
): [T, (next: T | ((prev: T) => T)) => void, () => void] {
  const subscribe = useCallback(
    (callback: () => void) => {
      const subs = getSubs(key);
      subs.add(callback);
      const onStorage = (e: StorageEvent) => {
        if (e.key === key) callback();
      };
      if (typeof window !== 'undefined') {
        window.addEventListener('storage', onStorage);
      }
      return () => {
        subs.delete(callback);
        if (typeof window !== 'undefined') {
          window.removeEventListener('storage', onStorage);
        }
      };
    },
    [key],
  );

  const getSnapshot = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  }, [key]);

  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null);

  const value: T = (() => {
    if (raw === null) return initial;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return initial;
    }
  })();

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      if (typeof window === 'undefined') return;
      const prev = (() => {
        const r = window.localStorage.getItem(key);
        if (r === null) return initial;
        try {
          return JSON.parse(r) as T;
        } catch {
          return initial;
        }
      })();
      const computed = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      window.localStorage.setItem(key, JSON.stringify(computed));
      notify(key);
    },
    [key, initial],
  );

  const clear = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
    notify(key);
  }, [key]);

  return [value, setValue, clear];
}
