export type ProductReviewSummary = {
  reviewCount: number;
  averageRating: number;
  ratingCounts: Record<1 | 2 | 3 | 4 | 5, number>;
};

export type ProductReviewItem = {
  id: string;
  productId: string;
  buyerId: string;
  orderId: string;
  rating: number;
  comment: string | null;
  images: string[] | null;
  createdAt: string | null;
  reviewerName: string | null;
  reviewerAvatar: string | null;
};

export type ProductReviewsResponse = {
  summary: ProductReviewSummary;
  items: ProductReviewItem[];
};

export type MyReviewEligibility = {
  canReview: boolean;
  productId: string;
  orderId: string | null;
  reason: string | null;
};

export type CreateMyReviewBody = {
  productId: string;
  rating: number;
  comment?: string;
};

export type CreateDemoReviewBody = {
  buyerId: string;
  productId: string;
  rating: number;
  comment?: string;
};