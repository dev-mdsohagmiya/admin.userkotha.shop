export const transformProductToDuplicatePayload = (productData: any) => {
  const transformedVariants =
    productData.variants?.map((v: any) => ({
      name: v.name,
      sku: v.sku ? `${v.sku}-copy` : undefined,
      conversionFactor: v.conversionFactor,
      sellingPrice: v.sellingPrice,
      discountedPrice: v.discountedPrice !== undefined ? v.discountedPrice : 0,
      minStock: v.minStock || 0,
      maxStock: v.maxStock || 0,
      currentStock: v.currentStock || 0,
      vatId: v.vatId || v.vat?.id,
      isDefault: !!v.isDefault,
      isDeliveryChargeFree: !!v.isDeliveryChargeFree,
      thumbnailId: v.thumbnail?.id || v.thumbnailId,
      imageIds:
        v.images?.map((img: any) => img.id || img).filter(Boolean) ||
        v.imageIds ||
        [],
    })) || [];

  return {
    name: `${productData.name} Copy`,
    slug: `${productData.slug}-copy`,
    sku: productData.sku ? `${productData.sku}-copy` : undefined,
    categoryId: productData.categoryId || productData.category?.id,
    brandId: productData.brandId || productData.brand?.id,
    baseUnitId: productData.baseUnitId || productData.baseUnit?.id,
    typeId:
      productData.typeId || productData.types?.map((t: any) => t.id || t) || [],
    isActive: true,
    isFeatured: !!productData.isFeatured,
    variants: transformedVariants,
    thumbnailId: productData.thumbnailId || productData.thumbnailImage?.id,
    imageIds:
      productData.imageIds ||
      productData.images?.map((img: any) => img.id || img).filter(Boolean) ||
      [],
    shortDesc: productData.shortDesc,
    detailedDesc: productData.detailedDesc,
  };
};

export const transformComboProductToDuplicatePayload = (comboData: any) => {
  const transformedVariants =
    comboData.variants?.map((v: any) => ({
      name: v.name,
      sku: v.sku ? `${v.sku}-copy` : undefined,
      conversionFactor: v.conversionFactor,
      sellingPrice: v.sellingPrice,
      discountedPrice: v.discountedPrice !== undefined ? v.discountedPrice : 0,
      minStock: v.minStock || 0,
      maxStock: v.maxStock || 0,
      currentStock: v.currentStock || 0,
      vatId: v.vatId || v.vat?.id,
      isDefault: !!v.isDefault,
      isDeliveryChargeFree: !!v.isDeliveryChargeFree,
      thumbnailId: v.thumbnail?.id || v.thumbnailId,
      imageIds:
        v.images?.map((img: any) => img.id || img).filter(Boolean) ||
        v.imageIds ||
        [],
      items:
        v.items?.map((item: any) => ({
          productId: item.productId || item.product?.id,
          variantId: item.variantId || item.variant?.id,
          quantity: item.quantity,
        })) || [],
    })) || [];

  return {
    name: `${comboData.name} Copy`,
    slug: `${comboData.slug}-copy`,
    sku: comboData.sku ? `${comboData.sku}-copy` : undefined,
    categoryId: comboData.categoryId || comboData.category?.id,
    brandId: comboData.brandId || comboData.brand?.id,
    baseUnitId: comboData.baseUnitId || comboData.baseUnit?.id,
    typeId:
      comboData.typeId || comboData.types?.map((t: any) => t.id || t) || [],
    isActive: true,
    isFeatured: !!comboData.isFeatured,
    variants: transformedVariants,
    thumbnailId: comboData.thumbnailId || comboData.thumbnailImage?.id,
    imageIds:
      comboData.imageIds ||
      comboData.images?.map((img: any) => img.id || img).filter(Boolean) ||
      [],
    shortDesc: comboData.shortDesc,
    detailedDesc: comboData.detailedDesc,
  };
};
