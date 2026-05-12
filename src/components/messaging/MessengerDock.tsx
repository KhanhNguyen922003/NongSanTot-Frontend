import { MessageCircle } from 'lucide-react';
import { ConversationThreadPanel } from '@/components/messaging/ConversationThreadPanel';
import { useMessengerDockStore, type MessengerDockEntry } from '@/stores/messengerDock.store';

function MinimizedTab({ entry }: { entry: MessengerDockEntry }) {
  const toggleMinimized = useMessengerDockStore((s) => s.toggleMinimized);
  return (
    <button
      type="button"
      onClick={() => toggleMinimized(entry.conversationId)}
      className="flex h-10 max-w-[200px] items-center gap-2 rounded-t-lg border border-b-0 border-slate-200 bg-[#0a7d42] px-3 text-left text-xs font-medium text-white shadow-lg"
    >
      <MessageCircle className="h-4 w-4 shrink-0 opacity-90" />
      <span className="truncate">{entry.title}</span>
    </button>
  );
}

function ChatWindow({ entry }: { entry: MessengerDockEntry }) {
  const closeEntry = useMessengerDockStore((s) => s.closeEntry);
  const toggleMinimized = useMessengerDockStore((s) => s.toggleMinimized);
  return (
    <div className="flex h-[min(72vh,440px)] w-[min(100vw-1rem,340px)] flex-col overflow-hidden rounded-t-lg border border-slate-200 bg-white shadow-2xl">
      <ConversationThreadPanel
        conversationId={entry.conversationId}
        variant="dock"
        expandHref={entry.expandHref}
        dockTitle={entry.title}
        dockSubtitle={entry.subtitle}
        onCloseDock={() => closeEntry(entry.conversationId)}
        onMinimizeDock={() => toggleMinimized(entry.conversationId)}
      />
    </div>
  );
}

export function MessengerDock() {
  const entries = useMessengerDockStore((s) => s.entries);
  if (entries.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-end gap-2 px-2 pb-[env(safe-area-inset-bottom)] md:px-3"
      aria-label="Khung chat nhanh"
    >
      <div className="pointer-events-auto flex flex-row-reverse items-end gap-2">
        {entries.map((e) =>
          e.minimized ? (
            <MinimizedTab key={e.conversationId} entry={e} />
          ) : (
            <ChatWindow key={e.conversationId} entry={e} />
          ),
        )}
      </div>
    </div>
  );
}
