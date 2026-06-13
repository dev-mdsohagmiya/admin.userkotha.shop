export interface IDeliveryOption {
  id: string;
  name: string;
  description: string;
  fee: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
