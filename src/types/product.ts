export interface IProductVariant {
  variantName: string;
  images: any;
  id: string;
  name: string;
  conversionFactor: number;
  sellingPrice: number;
  minStock: number;
  maxStock: number;
  thumbnail?: any;
  currentStock?: number;
  discountedPrice?: number;
  thumbnailImage?: any;
  sku: string;
  productName?: string;
  productId?: string;
  isDefault?: boolean;
  isActive?: boolean;
  isDeliveryChargeFree?: boolean;
}
export interface IProduct {
  id: string;
  name: string;
  categoryId: string;
  brandId: string;
  baseUnitId: string;
  description?: string;
  variants: IProductVariant[];
  isActive: boolean;
  slug: string;
  sku?: string;
}

//  get or get product

// types/units.ts
export interface IUnit {
  id: string;
  name: string;
  symbol?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// types/category.ts
export interface ICategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// types/brands.ts
export interface IBrand {
  id: string;
  name: string;
  logo?: string | null;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IProductVariantData {
  id: string;
  productId: string;
  unitId: string;
  conversionFactor: number;
  sellingPrice: number;
  minStock: number;
  maxStock: number;
  currentStock: number;
  sku: string;
  createdAt: string;
  updatedAt: string;
  unit?: IUnit; // nested unit object
}

export interface IProductData {
  hasBOM: any;
  id: string;
  bomCount: number;
  name: string;
  category?: ICategory; // nested category object
  brand?: IBrand; // nested brand object
  baseUnit?: IUnit; // nested base unit object
  variants?: IProductVariantData[];
  description: string;
  sku?: string;
  isActive: boolean;
  createdAt?: Date | string | undefined;
  updatedAt?: Date | string | undefined;
  bomItems?: any[]; // Add BOM items if needed
  slug: string;
  isFeatured?: boolean;
  productType?: "regular" | "combo"; // Discriminator field for product type
}

// update

export interface IUpdateProductVariant {
  id?: string; // optional, for existing variants
  unitId: string;
  conversionFactor: number;
  sellingPrice: number;
  discountedPrice?: number;
  minStock: number;
  maxStock: number;
  currentStock: number;
  thumbnailId?: string;
  imageIds?: string[];
  images?: any;
  isDefault?: boolean;
  isActive?: boolean;
  isDeliveryChargeFree?: boolean;
  sku?: string;
}
export interface IUpdateProduct {
  id: string; // product id for update
  name: string;
  categoryId: ICategory;
  brandId?: string;
  baseUnitId: string;
  shortDesc?: string;
  detailedDesc?: string;
  thumbnailId?: string;
  imageIds?: string[];
  variants?: IUpdateProductVariant[];
  isActive: boolean;
  slug: string;
  sku?: string;
}

export interface IHotDealData {
  id: string;
  productId: string;
  title: string;
  subtitle: string;
  description: string;
  startTime: string; // ISO Date
  endTime: string; // ISO Date
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product: IProductData;
}
