export interface IReview {
  id: string;
  productId: string;
  comboProductId: string | null;
  name: string;
  email: string | null;
  rating: number;
  review: string;
  isConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    thumbnail: {
      id: string;
      url: string;
    } | null;
  } | null;
  comboProduct: {
    id: string;
    name: string;
    thumbnail: {
      id: string;
      url: string;
    } | null;
  } | null;
}
