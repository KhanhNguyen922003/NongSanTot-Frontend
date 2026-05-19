import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { auth } from '../../../firebase.config';
import { queryKeys } from '@/constants/queryKeys';
import { apiClient, getApiBaseUrl } from '@/core/api/apiClient';
import { queryClient } from '@/queries';
import type {
  ChatMessage,
  ConversationDetail,
  MyConversationsResponse,
} from './types';

/** Danh sách hội thoại (không có SSE theo room). */
const CONVERSATIONS_POLL_MS = 12000;
/** Dự phòng khi SSE tạm lỗi / proxy ngắt kết nối. */
const THREAD_FALLBACK_POLL_MS = 20000;

export const useOpenProductConversationMutation = () =>
  useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await apiClient.post<{ id: string }>('/conversations/open-product', {
        productId,
      });
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.messaging.mine });
    },
  });

export const useMyConversationsQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.messaging.mine,
    queryFn: async () => {
      const { data } = await apiClient.get<MyConversationsResponse>('/conversations/me');
      return data;
    },
    enabled,
    refetchInterval: enabled ? CONVERSATIONS_POLL_MS : false,
    refetchIntervalInBackground: false,
  });

export const useConversationDetailQuery = (conversationId: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.messaging.detail(conversationId),
    queryFn: async () => {
      const { data } = await apiClient.get<ConversationDetail>(
        `/conversations/${conversationId}`,
      );
      return data;
    },
    enabled: !!conversationId && enabled,
    refetchInterval:
      !!conversationId && enabled ? THREAD_FALLBACK_POLL_MS : false,
    refetchIntervalInBackground: false,
  });

export const useConversationMessagesQuery = (conversationId: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.messaging.messages(conversationId),
    queryFn: async () => {
      const { data } = await apiClient.get<ChatMessage[]>(
        `/conversations/${conversationId}/messages`,
      );
      return data;
    },
    enabled: !!conversationId && enabled,
    refetchInterval:
      !!conversationId && enabled ? THREAD_FALLBACK_POLL_MS : false,
    refetchIntervalInBackground: false,
  });

export const useMarkConversationReadMutation = (conversationId: string) =>
  useMutation({
    mutationFn: async () => {
      await apiClient.patch(`/conversations/${conversationId}/read`);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.messaging.messages(conversationId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.messaging.detail(conversationId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.messaging.mine });
    },
  });

function invalidateConversationQueries(conversationId: string) {
  void queryClient.invalidateQueries({
    queryKey: queryKeys.messaging.messages(conversationId),
  });
  void queryClient.invalidateQueries({
    queryKey: queryKeys.messaging.detail(conversationId),
  });
  void queryClient.invalidateQueries({
    queryKey: queryKeys.messaging.mine,
  });
}

/**
 * Giữ kết nối SSE tới `/conversations/:id/events` — server đẩy ngay khi có tin / đề xuất.
 * Có tự kết nối lại khi mất mạng.
 */
export const useConversationActivitySubscription = (conversationId: string | undefined) => {
  useEffect(() => {
    if (!conversationId) return;

    const ac = new AbortController();
    let cancelled = false;
    let attempt = 0;

    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    const readSseLoop = async () => {
      while (!cancelled && !ac.signal.aborted) {
        try {
          const user = auth.currentUser;
          if (!user) return;
          const token = await user.getIdToken();
          const base = getApiBaseUrl();
          const res = await fetch(`${base}/conversations/${conversationId}/events`, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'text/event-stream',
            },
            signal: ac.signal,
          });

          if (!res.ok) {
            attempt += 1;
            await sleep(Math.min(1000 * attempt, 8000));
            continue;
          }

          attempt = 0;
          const body = res.body;
          if (!body) {
            await sleep(2000);
            continue;
          }

          const reader = body.getReader();
          const decoder = new TextDecoder();
          let buf = '';

          while (!cancelled && !ac.signal.aborted) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });

            let sep: number;
            while ((sep = buf.indexOf('\n\n')) >= 0) {
              const block = buf.slice(0, sep);
              buf = buf.slice(sep + 2);
              const dataLine = block.split('\n').find((l) => l.startsWith('data:'));
              if (!dataLine) continue;
              const raw = dataLine.replace(/^data:\s*/i, '').trim();
              if (!raw) continue;
              try {
                const ev = JSON.parse(raw) as any;
                if (ev.type === 'ping') continue;

                // If server sent the created message payload, apply it directly to cache
                if (ev.type === 'message' && ev.message) {
                  const key = queryKeys.messaging.messages(conversationId);
                  queryClient.setQueryData(key, (old?: ChatMessage[]) => {
                    const exists = old?.some((m) => m.id === ev.message.id);
                    if (old && exists) return old;
                    return old ? [...old, ev.message] : [ev.message];
                  });

                  // update conversation detail's lastMessage/updatedAt quickly
                  void queryClient.setQueryData(queryKeys.messaging.detail(conversationId), (old: any) => {
                    if (!old) return old;
                    return {
                      ...old,
                      conversation: {
                        ...old.conversation,
                        lastMessage: ev.message.content ?? old.conversation.lastMessage,
                        updatedAt: ev.message.createdAt ?? old.conversation.updatedAt,
                      },
                    };
                  });

                  // also refresh convo list minimally
                  void queryClient.invalidateQueries({ queryKey: queryKeys.messaging.mine });
                  continue;
                }
              } catch {
                // vẫn refetch nếu payload không parse được
              }
              invalidateConversationQueries(conversationId);
            }
          }
        } catch {
          if (cancelled || ac.signal.aborted) return;
          attempt += 1;
          await sleep(Math.min(1000 * attempt, 8000));
        }
      }
    };

    void readSseLoop();

    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [conversationId]);
};

export const useSendChatMessageMutation = (conversationId: string) =>
  useMutation({
    mutationFn: async (content: string) => {
      const { data } = await apiClient.post(`/conversations/${conversationId}/messages`, {
        content,
      });
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.messaging.messages(conversationId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.messaging.detail(conversationId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.messaging.mine });
    },
  });

export type CreateOfferInput = {
  unitPrice: number;
  quantity: number;
  parentOfferId?: string;
};

export const useCreateNegotiationOfferMutation = (conversationId: string) =>
  useMutation({
    mutationFn: async (body: CreateOfferInput) => {
      const { data } = await apiClient.post(`/conversations/${conversationId}/offers`, body);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.messaging.messages(conversationId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.messaging.detail(conversationId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.messaging.mine });
    },
  });

export const useAcceptNegotiationOfferMutation = (conversationId: string) =>
  useMutation({
    mutationFn: async (offerId: string) => {
      const { data } = await apiClient.patch(
        `/conversations/${conversationId}/offers/${offerId}/accept`,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.messaging.messages(conversationId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.messaging.detail(conversationId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.messaging.mine });
    },
  });

export const useDeclineNegotiationOfferMutation = (conversationId: string) =>
  useMutation({
    mutationFn: async (offerId: string) => {
      const { data } = await apiClient.patch(
        `/conversations/${conversationId}/offers/${offerId}/decline`,
      );
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.messaging.messages(conversationId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.messaging.detail(conversationId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.messaging.mine });
    },
  });

export const useCreateOrderFromOfferMutation = (conversationId: string) =>
  useMutation({
    mutationFn: async (payload: { offerId: string; note?: string }) => {
      const { data } = await apiClient.post(
        `/conversations/${conversationId}/offers/${payload.offerId}/create-order`,
        { note: payload.note },
      );
      return data as { order: { id: string } };
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.messaging.detail(conversationId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.messaging.messages(conversationId),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.mySell });
      void queryClient.invalidateQueries({ queryKey: queryKeys.orders.myBuyPrefix });
      void queryClient.invalidateQueries({ queryKey: queryKeys.messaging.mine });
    },
  });
