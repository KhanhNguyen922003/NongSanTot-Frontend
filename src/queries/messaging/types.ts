export type ConversationSide = 'buyer' | 'seller';

export type ConversationListRow = {
  id: string;
  productId: string | null;
  lastMessage: string | null;
  updatedAt: string | null;
  productName: string | null;
  shopName: string | null;
  side: ConversationSide;
  buyerId: string;
  buyerHint?: string;
  /** Tin từ đối phương chưa đọc (theo mốc last read của bạn). */
  unreadCount: number;
  /** Lần cuối bạn mở thread / đánh dấu đã xem (server). */
  lastReadAt: string | null;
};

export type NegotiationOffer = {
  id: string;
  conversationId: string;
  productId: string;
  proposedByUserId: string;
  unitPrice: number;
  quantity: number;
  awaitingParty: ConversationSide | null;
  status: 'pending' | 'accepted' | 'superseded' | 'declined';
  parentOfferId: string | null;
  createdAt: string | null;
};

export type ConversationDetail = {
  conversation: {
    id: string;
    userId: string;
    shopId: string;
    productId: string | null;
    lastMessage: string | null;
    updatedAt: string | null;
  };
  role: ConversationSide;
  shop: { id: string; name: string; ownerId: string };
  product: {
    id: string;
    name: string;
    coverImage: string | null;
    price: number;
    stock: number;
    unit: string | null;
  } | null;
  buyer: { id: string; fullName: string; phone: string } | null;
  offers: NegotiationOffer[];
  ordersByOfferId: Record<string, string>;
  awaitingBuyerAddressOrder: {
    id: string;
    status: string;
    negotiationOfferId: string | null;
  } | null;
  readReceipts?: {
    myLastReadAt: string | null;
    otherLastReadAt: string | null;
  };
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  kind: 'text' | 'offer';
  negotiationOfferId: string | null;
  isRead: boolean | null;
  createdAt: string | null;
  offer: NegotiationOffer | null;
};

export type MyConversationsResponse = {
  buyer: ConversationListRow[];
  seller: ConversationListRow[];
};
