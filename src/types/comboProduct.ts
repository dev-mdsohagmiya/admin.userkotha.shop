export interface IComboProductItem {
  productId: string;
  variantId: string;
  quantity: number;
  conversionFactor?: number; // For calculating actual quantity needed
}

export interface IComboProductVariant {
  id?: string;
  name: string;
  thumbnailId?: string;
  thumbnail: any;
  imageIds?: string[];
  images?: any[];
  conversionFactor: number;
  sellingPrice: number;
  discountedPrice?: number;
  minStock: number;
  maxStock: number;
  currentStock: number;
  vatId?: string;
  sku?: string;
  items: IComboProductItem[];
  isActive?: boolean;
  isDefault?: boolean;
  isDeliveryChargeFree?: boolean;
}

export interface IComboProduct {
  id?: string;
  name: string;
  thumbnailId: string;
  categoryId: string;
  brandId?: string;
  baseUnitId: string;
  shortDesc?: string;
  detailedDesc?: string;
  imageIds?: string[];
  variants: IComboProductVariant[];
  isActive?: boolean;
  typeId?: string[];
  isFeatured?: boolean;
  isPlan?: boolean;
  slug: string;
  sku?: string;
}

export interface IComboProductData {
  id: string;
  comboId: string;
  name: string;
  category?: any; // nested category object
  brand?: any; // nested brand object
  baseUnit?: any; // nested base unit object
  variants?: IComboProductVariant[];
  shortDesc?: string;
  detailedDesc?: string;
  isActive: boolean;
  price: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  slug: string;
  sku?: string;
  types?: any[];
  isFeatured?: boolean;
  isPlan?: boolean;
  productType?: "regular" | "combo"; // Discriminator field for product type
}

export interface IUpdateComboProductVariant {
  id?: string; // optional, for existing variants
  name: string;
  conversionFactor: number;
  sellingPrice: number;
  discountedPrice?: number;
  minStock: number;
  maxStock: number;
  currentStock: number;
  imageIds?: string[];
  sku?: string;
  isActive?: boolean;
  isDefault?: boolean;
  isDeliveryChargeFree?: boolean;
}

export interface IUpdateComboProduct {
  id: string; // combo product id for update
  comboId: string;
  name: string;
  categoryId: string;
  brandId: string;
  baseUnitId: string;
  shortDesc?: string;
  detailedDesc?: string;
  thumbnailId?: string;
  imageIds?: string[];
  variants?: IUpdateComboProductVariant[];
  isActive: boolean;
  isPlan?: boolean;
  price?: number;
  typeIds?: string[];
  slug: string;
}

// ================================
// Combo Production Plan Types
// ================================
export interface IComboProductionPlanItem {
  id?: string;
  comboVariantId: string;
  plannedQty: number;
  completedQty?: number;
  comboVariant?: IComboProductVariant;
}

export interface IComboProductionPlan {
  id?: string;
  productionId: string;
  items: IComboProductionPlanItem[];
  notes?: string;
  status?: string;
  production?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICreateComboProductionPlan {
  items: Array<{
    comboVariantId: string;
    plannedQty: number;
  }>;
  notes?: string;
  status?: string;
  startDate?: string;
}

// ================================
// Combo Requisition Types
// ================================
export interface IComboRequisitionVariant {
  comboVariantId: string;
  batchSize: number;
}

export interface IComboVariantBreakdown {
  comboVariantId: string;
  comboVariantName: string;
  batchSize: number;
  items: Array<{
    productId: string;
    productName: string;
    variantId: string;
    variantName: string;
    quantity: number;
  }>;
}

export interface IProductVariantRequirement {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  requiredQuantity: number;
  comboVariants: Array<{
    comboVariantId: string;
    comboVariantName: string;
    batchSize: number;
    requiredQuantity: number;
  }>;
}

export interface ICreateComboRequisition {
  comboProductId: string;
  productionId?: string;
  comboVariants: IComboRequisitionVariant[];
  purpose?: string;
  notes?: string;
}

export interface IComboRequisitionItem {
  id: string;
  materialId: string;
  materialName: string;
  materialType: string;
  quantity: number;
  sku: string;
  currentStock: number;
  category: string;
}

export interface IComboRequisition {
  id: string;
  requisitionNumber: string;
  comboProductId: string;
  type: string;
  batchSize: number;
  status: string;
  items: IComboRequisitionItem[];
  comboVariantBreakdown: IComboVariantBreakdown[];
  productVariantRequirements: IProductVariantRequirement[];
  purpose?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ================================
// Combo Packaging BOM Types
// ================================
export interface IPackagingBOMItem {
  materialId: string;
  quantity: number;
}

export interface ICreatePackagingBOM {
  comboProductId: string;
  comboVariantId: string;
  items: IPackagingBOMItem[];
}

export interface IPackagingBOM {
  id: string;
  comboProductId: string;
  comboVariantId: string;
  materialId: string;
  quantity: number;
  variant?: {
    id: string;
    name: string;
    sku: string;
  };
  material?: {
    id: string;
    name: string;
    type: string;
    currentStock: number;
    unit?: {
      id: string;
      name: string;
      symbol: string;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface IUpdatePackagingBOM {
  quantity: number;
}

// ================================
// Combo Packaging Requisition Types
// ================================
export interface IPackagingRequisitionVariant {
  comboVariantId: string;
  batchSize: number;
}

export interface IPackagingMaterialDetail {
  materialName: string;
  quantity: number;
}

export interface IComboVariantPackagingBreakdown {
  comboVariantId: string;
  comboVariantName: string;
  batchSize: number;
  packagingMaterials: IPackagingMaterialDetail[];
}

export interface ICreatePackagingRequisition {
  comboProductId: string;
  productionId?: string;
  comboVariants: IPackagingRequisitionVariant[];
  purpose?: string;
  notes?: string;
}

export interface IPackagingRequisitionItem {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  unit?: {
    id: string;
    name: string;
    symbol: string;
  };
}

export interface IPackagingRequisition {
  id: string;
  requisitionNumber: string;
  comboProductId: string;
  type: string;
  batchSize: number;
  status: string;
  items: IPackagingRequisitionItem[];
  comboVariantBreakdown: IComboVariantPackagingBreakdown[];
  purpose?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
