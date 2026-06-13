export interface IHotDeal {
  id?: string;
  productId: string;
  title: string;
  subtitle: string;
  description: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IHotDealData extends IHotDeal {
  product?: {
    id: string;
    name: string;
    category?: any;
    brand?: any;
  };
}

export interface ICreateHotDeal {
  productId: string;
  title: string;
  subtitle: string;
  description: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface IUpdateHotDeal {
  id: string;
  productId: string;
  title: string;
  subtitle: string;
  description: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}
