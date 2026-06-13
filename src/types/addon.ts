export interface IAddon {
  id: string;
  productId?: string | null;
  productVariantId: string;
  comboProductId?: string | null;
  comboVariantId?: string | null;
  addonProductVariantId: string;
  addonComboVariantId?: string | null;
  priority: number;
  matchDiscount: boolean;
  matchDeliveryOffer: boolean;
  offerLabel: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    thumbnail: {
      url: string;
    };
  } | null;
  productVariant?: {
    id: string;
    name: string;
    thumbnail: {
      url: string;
    };
  };
  addonProductVariant?: {
    id: string;
    name: string;
    productId: string;
    thumbnail?: {
      url: string;
    };
    product?: {
      id: string;
      name: string;
    };
  };
  comboProduct?: any | null;
  comboVariant?: any | null;
  addonComboVariant?: {
    id: string;
    name: string;
    comboProductId: string;
    thumbnail?: {
      url: string;
    };
    comboProduct?: {
      id: string;
      name: string;
    };
  } | null;
}

export interface ICreateAddonResult {
  success: boolean;
  status: number;
  message: string;
  data: IAddon;
}

export interface IGetAllAddonsResult {
  success: boolean;
  status: number;
  message: string;
  data: IAddon[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}
