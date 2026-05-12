import { create } from 'zustand';

export type MessengerDockEntry = {
  conversationId: string;
  expandHref: string;
  title: string;
  subtitle: string;
  minimized: boolean;
};

const MAX_WINDOWS = 2;

type MessengerDockState = {
  entries: MessengerDockEntry[];
  openEntry: (e: Omit<MessengerDockEntry, 'minimized'>) => void;
  closeEntry: (conversationId: string) => void;
  toggleMinimized: (conversationId: string) => void;
};

export const useMessengerDockStore = create<MessengerDockState>((set) => ({
  entries: [],
  openEntry: (e) =>
    set((s) => {
      const idx = s.entries.findIndex((x) => x.conversationId === e.conversationId);
      if (idx >= 0) {
        const next = [...s.entries];
        next[idx] = {
          ...next[idx],
          expandHref: e.expandHref,
          title: e.title,
          subtitle: e.subtitle,
          minimized: false,
        };
        return { entries: next };
      }
      let entries = [...s.entries, { ...e, minimized: false }];
      if (entries.length > MAX_WINDOWS) {
        entries = entries.slice(entries.length - MAX_WINDOWS);
      }
      return { entries };
    }),
  closeEntry: (conversationId) =>
    set((s) => ({
      entries: s.entries.filter((x) => x.conversationId !== conversationId),
    })),
  toggleMinimized: (conversationId) =>
    set((s) => ({
      entries: s.entries.map((x) =>
        x.conversationId === conversationId ? { ...x, minimized: !x.minimized } : x,
      ),
    })),
}));
