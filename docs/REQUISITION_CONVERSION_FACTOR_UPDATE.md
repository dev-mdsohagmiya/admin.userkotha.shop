# Requisition Modal Conversion Factor Updates

## Overview

Updated requisition modals (Raw Material and Packaging Material) to use conversion factor calculations from product planning. This ensures batch sizes are calculated in kilograms (kg) based on variant conversion factors.

## Changes Made

### 1. Raw Material Requisition Modal

**File:** `src/components/common/Modals/RequisitionApproval/RawMaterialRequisitionSetupModal.tsx`

#### Added Conversion Factor Calculation

```typescript
// Calculate batch size from planItems using conversion factors
const calculateBatchSizeInKg = () => {
  if (planItems && planItems.length > 0) {
    return planItems.reduce((sum: number, item: any) => {
      const conversionFactor = item.variant?.conversionFactor || 1;
      return sum + (item.plannedQty * conversionFactor) / 1000;
    }, 0);
  }
  return initialBatchSize || 0;
};
```

#### Updated UI Display

- Changed batch size label from dynamic unit (`{product?.baseUnit?.name || 'Units'}`) to fixed **"kg"**
- This reflects the conversion factor calculation that produces batch size in kilograms

**Before:**

```tsx
<Text type="secondary" style={{ marginLeft: "8px" }}>
  {product?.baseUnit?.name || "Units"}
</Text>
```

**After:**

```tsx
<Text type="secondary" style={{ marginLeft: "8px" }}>
  kg
</Text>
```

### 2. Packaging Material Requisition Modal

**File:** `src/components/common/Modals/RequisitionApproval/PackagingMaterialRequisitionSetupModal.tsx`

#### Added Conversion Factor Calculation

```typescript
// Calculate batch size from planItems using conversion factors
const calculateBatchSizeInKg = () => {
  if (planItems && planItems.length > 0) {
    return planItems.reduce((sum: number, item: any) => {
      const conversionFactor = item.variant?.conversionFactor || 1;
      return sum + (item.plannedQty * conversionFactor) / 1000;
    }, 0);
  }
  return initialBatchSize || 0;
};
```

#### Updated Quantity Calculation

- Changed from percentage-based to quantity-based calculation
- Removed division by 100 since 'percentage' field now stores quantity per unit

**Before:**

```typescript
const calculateQuantityToRequest = (item: PackagingMaterialRequirement) => {
  const variantPlannedQty = getVariantPlannedQty(item.variantId);
  return variantPlannedQty
    ? (Number(variantPlannedQty) * item.percentage) / 100
    : 0;
};
```

**After:**

```typescript
// Note: 'percentage' field now stores quantity per unit (not actual percentage)
const calculateQuantityToRequest = (item: PackagingMaterialRequirement) => {
  const variantPlannedQty = getVariantPlannedQty(item.variantId);
  return variantPlannedQty ? Number(variantPlannedQty) * item.percentage : 0;
};
```

#### Updated Column Headers

- Changed "Required Qty (%)" to **"Quantity per Unit"**
- Updated display to show quantity with unit instead of percentage

**Before:**

```tsx
{
  title: "Required Qty (%)",
  dataIndex: "percentage",
  key: "percentage",
  render: (_: any, record: PackagingMaterialRequirement) => (
    <span>{record.percentage} %</span>
  ),
}
```

**After:**

```tsx
{
  title: "Quantity per Unit",
  dataIndex: "percentage",
  key: "percentage",
  render: (_: any, record: PackagingMaterialRequirement) => (
    <span>{record.percentage} {record.unit}</span>
  ),
}
```

#### Updated UI Display

- Changed label from "Planned Quantity" to **"Batch Size"**
- Changed unit from dynamic (`{fullProduct?.baseUnit?.name}`) to fixed **"kg"**

**Before:**

```tsx
<Text strong>Planned Quantity:</Text>
<InputNumber
  // ... props
/>
<Text type="secondary" style={{ marginLeft: "8px" }}>
  {fullProduct?.baseUnit?.name || product?.baseUnit?.name || "Units"}
</Text>
```

**After:**

```tsx
<Text strong>Batch Size:</Text>
<InputNumber
  // ... props
/>
<Text type="secondary" style={{ marginLeft: "8px" }}>
  kg
</Text>
```

### 3. Production List Integration

**File:** `src/pages/Production/Production/ProductionList.tsx`

#### Added planItems Prop to Raw Material Requisition Modal

- Ensures variant-specific data (including conversion factors) is passed to the modal

**Before:**

```tsx
<RawMaterialRequisitionSetupModal
  open={openRawMaterialRequisition}
  setOpen={setOpenRawMaterialRequisition}
  product={selectedProduction.product}
  productId={selectedProduction.productId}
  initialBatchSize={selectedProduction.plannedQty}
  readOnlyBatchSize={true}
  onSuccess={handleRawMaterialSuccess}
  productionId={selectedProduction.id}
  productionNumber={selectedProduction.productionNumber}
/>
```

**After:**

```tsx
<RawMaterialRequisitionSetupModal
  open={openRawMaterialRequisition}
  setOpen={setOpenRawMaterialRequisition}
  product={selectedProduction.product}
  productId={selectedProduction.productId}
  initialBatchSize={selectedProduction.plannedQty}
  readOnlyBatchSize={true}
  onSuccess={handleRawMaterialSuccess}
  productionId={selectedProduction.id}
  productionNumber={selectedProduction.productionNumber}
  planItems={selectedProduction.plan?.items}
/>
```

**Note:** PackagingMaterialRequisitionSetupModal was already receiving `planItems={selectedProduction.plan?.items}`

### 4. TypeScript Interface Update

**File:** `src/types/requisition.ts`

Updated `RequisitionSetupModalProps` interface to include variant data with conversion factor:

```typescript
planItems?: Array<{
  variantId: string;
  plannedQty: number;
  variant?: {
    conversionFactor?: number;
    name?: string;
  };
}>;
```

## Calculation Logic

### Conversion Factor to Batch Size (kg)

For multiple variants in a production plan:

```
Batch Size (kg) = Σ (Planned Qty × Conversion Factor) / 1000

Example:
- Variant A: 10 units × 400g = 4,000g = 4.000 kg
- Variant B: 5 units × 250g = 1,250g = 1.250 kg
- Total Batch Size = 5.250 kg
```

### Packaging Material Quantity Calculation

Previously percentage-based, now quantity-based:

```
Quantity to Request = Planned Qty × Quantity per Unit

Example:
- Planned Qty: 10 units
- Quantity per Unit: 2 (e.g., 2 labels per unit)
- Quantity to Request = 10 × 2 = 20 labels
```

**Note:** The 'percentage' database field is reused to store quantity per unit for backward API compatibility.

## Testing Checklist

- [ ] Create a product with multiple variants having different conversion factors
- [ ] Create a production plan with multiple variants
- [ ] Open Raw Material Requisition modal from production list
  - [ ] Verify batch size shows in kg
  - [ ] Verify batch size calculates correctly using conversion factors
  - [ ] Verify material quantities are correct
- [ ] Open Packaging Material Requisition modal from production list
  - [ ] Verify batch size shows in kg
  - [ ] Verify "Quantity per Unit" column shows quantity with unit (not percentage)
  - [ ] Verify "Quantity to Request" calculates correctly (planned qty × quantity per unit)
- [ ] Create both requisitions and verify data is saved correctly

## Related Files

- `src/pages/Product/Planning.tsx` - Updated in previous changes
- `src/components/common/Modals/BOM/PackagingMaterialBOMSetupModal.tsx` - Updated in previous changes
- `CONVERSION_FACTOR_FIX.md` - Previous documentation for planning changes

## Impact

- Batch sizes now consistently displayed in kilograms across planning and requisition flows
- Packaging materials use clear quantity-based approach instead of confusing percentages
- Variant-specific planning data properly flows from planning → production → requisitions
- All calculations use conversion factors ensuring accurate material requirements

## Backward Compatibility

- API remains unchanged (packaging quantities still stored in 'percentage' field)
- Old productions without planItems will use initialBatchSize fallback
- UI updates are cosmetic (percentage → quantity) with calculation logic adjusted accordingly
