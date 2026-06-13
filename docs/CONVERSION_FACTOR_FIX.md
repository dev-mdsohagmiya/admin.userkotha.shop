# Product Planning Fixes - Conversion Factor & Packaging Quantities

## Issues Fixed

### 1. Conversion Factor Issue

The product planning system was not properly accounting for variant conversion factors (in grams) when calculating total batch sizes and material requirements.

### 2. Packaging Material Issue

Packaging materials were using percentages instead of actual quantities needed per unit.

## Problem Examples

### Conversion Factor:

- Variant A: 400g conversion factor, planned qty = 10

  - **Before**: Total = 10 units ❌
  - **After**: Total = 4.000 kg ✅ (10 × 400g / 1000)

- Variant B: 1000g conversion factor, planned qty = 5

  - **Before**: Total = 5 units ❌
  - **After**: Total = 5.000 kg ✅ (5 × 1000g / 1000)

- **Before Total**: 15 units ❌
- **After Total**: 9.000 kg ✅

### Packaging Materials:

- **Before**: "Use 10% tape" (confusing) ❌
- **After**: "Use 2 tapes per unit" (clear) ✅

## Files Modified

### 1. `/src/pages/Product/Planning.tsx`

**Conversion Factor Changes:**

- Added `conversionFactor` to `VariantQty` interface
- Updated total quantity calculation:
  ```typescript
  const totalQty = variantQtys.reduce((sum, item) => {
    const qtyInKg = (item.qty * item.conversionFactor) / 1000;
    return sum + qtyInKg;
  }, 0);
  ```
- Added columns: "Conversion Factor (g)" and "Total (kg)"
- Batch size displays as "X.XXX kg"

**Packaging Material Changes:**

- Updated calculation to use quantity instead of percentage:
  ```typescript
  const calculateQuantityToRequest = (item: any) => {
    const variantPlannedQty = variantQtys.find(
      (v) => v.variantId === selectedVariantId
    );
    if (!variantPlannedQty || variantPlannedQty.qty === 0) return 0;
    // item.percentage stores quantity per unit
    return variantPlannedQty.qty * item.percentage;
  };
  ```
- Changed column header from "Required Qty (%)" to "Qty per Unit"

### 2. `/src/components/common/Modals/BOM/PackagingMaterialBOMSetupModal.tsx`

**Major Changes:**

- Removed percentage-based validation
- Changed form field from "Percentage (%)" to "Quantity"
- Updated table column to show "Quantity" with unit symbol
- Removed 100% total validation
- Simplified to just count total items instead of percentage
- Updated modal subtitle to reflect quantity-based approach

**Before:**

```typescript
// Percentage validation - ensure total = 100%
if (totalPercentage !== 100) {
  message.error(`Total percentage must be 100%. Current: ${totalPercentage}%`);
  return;
}
```

**After:**

```typescript
// Just ensure we have at least one item
if (bomItems.length === 0) {
  message.error("Please add at least one material to BOM");
  return;
}
```

## How It Works

### Raw Material BOM (Percentage-based)

```
Total KG = (Planned Qty × Conversion Factor in grams) ÷ 1000
Material Required = Total KG × Percentage ÷ 100
```

### Packaging Material BOM (Quantity-based)

```
Total Quantity = Planned Qty × Quantity per Unit
```

### Complete Example

**Setup:**

- Product: "Energy Bar"
- Variants:
  - Small (400g) - Plan 10 units
  - Large (1000g) - Plan 5 units

**Step 1: Calculate Total Batch Size**

- Small: 10 × 400g / 1000 = 4.000 kg
- Large: 5 × 1000g / 1000 = 5.000 kg
- **Total: 9.000 kg**

**Step 2: Raw Material BOM (based on 9 kg total)**

- Oats: 60% → 9 kg × 0.60 = 5.4 kg
- Honey: 30% → 9 kg × 0.30 = 2.7 kg
- Nuts: 10% → 9 kg × 0.10 = 0.9 kg

**Step 3: Packaging Material BOM (per variant, quantity-based)**

Small Variant (10 units):

- Wrapper: 1 per unit → 10 wrappers
- Label: 2 per unit → 20 labels

Large Variant (5 units):

- Box: 1 per unit → 5 boxes
- Seal: 1 per unit → 5 seals
- Label: 3 per unit → 15 labels

## UI Changes

### Planning Table - Before:

| Variant   | Qty          |
| --------- | ------------ |
| Small     | 10           |
| Large     | 5            |
| **Total** | **15 units** |

### Planning Table - After:

| Variant              | CF (g) | Planned Qty | Total (kg)   |
| -------------------- | ------ | ----------- | ------------ |
| Small                | 400g   | 10          | 4.000 kg     |
| Large                | 1000g  | 5           | 5.000 kg     |
| **Total Batch Size** |        |             | **9.000 kg** |

### Packaging BOM Setup - Before:

| Material  | Percentage                |
| --------- | ------------------------- |
| Tape      | 10%                       |
| Poly      | 15%                       |
| **Total** | **25%** ❌ (Must be 100%) |

### Packaging BOM Setup - After:

| Material        | Quantity |
| --------------- | -------- |
| Tape            | 2 pcs    |
| Poly            | 1 roll   |
| **Total Items** | **2** ✅ |

## API Compatibility

**Important:** The `percentage` field in the API is reused to store quantity for packaging materials:

```typescript
// BOMItem structure
{
  materialId: string;
  percentage: number;  // Stores percentage for raw materials
                       // Stores quantity for packaging materials
  type: 'raw' | 'packaging';
  variantId?: string;  // Only for packaging
}
```

This maintains backward compatibility while supporting the new quantity-based approach.

## Benefits

### ✅ Conversion Factor Fix

- Accurate batch size calculations in kg
- Correct raw material quantities
- Proper inventory tracking
- Reliable cost calculations

### ✅ Packaging Quantity Fix

- Easier to understand (2 tapes vs 10%)
- More intuitive for warehouse staff
- Accurate material ordering
- Simpler BOM setup (no 100% constraint)

## Testing Checklist

- [ ] Create product with multiple variants (different conversion factors)
- [ ] Plan production with different quantities per variant
- [ ] Verify total batch size shows in kg
- [ ] Setup raw material BOM (percentage-based)
- [ ] Verify raw material calculations use kg total
- [ ] Setup packaging material BOM (quantity-based)
- [ ] Verify packaging calculations multiply qty per unit
- [ ] Create requisitions for both materials
- [ ] Verify inventory deductions match calculations

## Scope

**Implemented:**

- ✅ Product Planning with conversion factor
- ✅ Packaging Material BOM with quantities

**Not Implemented:**

- ⏳ Combo Product Planning (future)
- ⏳ Combo Packaging BOM (future)

## Technical Notes

- Conversion factors: stored in grams, displayed in grams, calculated to kg
- Batch sizes: displayed with 3 decimal precision (X.XXX kg)
- Packaging quantities: stored in `percentage` field for API compatibility
- Field type detection: `type === 'packaging'` uses quantity logic
- Backward compatibility: defaults conversion factor to 1g if missing

---

**Date:** November 23, 2025  
**Developer:** GitHub Copilot  
**Status:** ✅ Completed
