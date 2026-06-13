# Review Image Modal Implementation

## Overview

Created a new Review Image Modal component that allows administrators to add review images to products. The modal integrates with the existing media library and review API.

## Files Created/Modified

### 1. Created: `ReviewImageModal.tsx`

**Location:** `src/components/common/Modals/ReviewImageModal.tsx`

**Features:**

- Allows selection of multiple images from the media library
- Supports both regular products and combo products
- Preview of selected images with ability to remove individual images
- Integration with MediaUploadModal for image selection
- Proper error handling and success notifications

**Props:**

```typescript
interface ReviewImageModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  productId: string;
  isComboProduct?: boolean; // Default: false
}
```

**API Integration:**

- Uses `useCreateReviewMutation` from `reviewApi`
- Sends payload in format:
  ```json
  {
    "productId": "product-id", // or "comboProductId" for combo products
    "mediaIds": ["media-id-1", "media-id-2"]
  }
  ```

### 2. Modified: `ProductList.tsx`

**Location:** `src/pages/Product/ProductList.tsx`

**Changes:**

1. Added import for `ReviewImageModal`
2. Added state management:
   - `openReviewImage` - controls modal visibility
   - `selectedOneProductId` - stores the selected product ID
3. Added "Review Image Add" button in the Action column
4. Rendered `ReviewImageModal` at the bottom of the component

**Button Location:**

- Appears in the Action column of the products table
- Only visible for users with update permissions
- Icon: `MdReviews` (Material Design Reviews icon)
- Type: Primary button

## API Endpoint

**Endpoint:** `POST /reviews/images/bulk`

**Request Body:**

```json
{
  "productId": "cmjv3rgzn008ap8yg8g32fmz8",
  "mediaIds": ["cmjjwtlzc0010nw7xfkvvcfnr", "cmjjwimzj000qnw7xvq3hprnw"]
}
```

For combo products:

```json
{
  "comboProductId": "combo-product-id",
  "mediaIds": ["media-id-1", "media-id-2"]
}
```

## User Flow

1. **Open Modal:**

   - User clicks the "Review Image Add" button (review icon) in the products table
   - Modal opens with empty state

2. **Select Images:**

   - User clicks "Click to select images" button
   - MediaUploadModal opens with all available images
   - User can:
     - Select existing images from the library
     - Upload new images
     - Browse through folders
   - Selected images are shown with checkmarks

3. **Review Selection:**

   - Modal shows preview of all selected images
   - User can remove individual images by hovering and clicking "Remove"
   - Counter shows total selected images

4. **Submit:**

   - User clicks "Add Review Images (X)" button
   - API call is made to create review images
   - Success toast notification appears
   - Modal closes automatically

5. **Cancel:**
   - User can cancel at any time
   - All selections are cleared
   - Modal closes

## Features

### Image Selection

- **Multiple Selection:** Users can select multiple images at once
- **Visual Feedback:** Selected images show a checkmark overlay
- **Preview Grid:** 3-column grid layout for selected images
- **Hover Actions:** Remove button appears on hover

### Validation

- Minimum 1 image required
- Warning message if user tries to submit without images

### Error Handling

- API errors are caught and displayed as toast notifications
- Proper error messages extracted from response

### State Management

- Form state resets when modal opens/closes
- Selected images cleared on cancel or successful submission

## Permissions

- Only users with `hasUpdate` permission can see the review button
- Permission check: `getModulePermissions(permissions, role, "Products")`

## Styling

- Uses Ant Design components for consistency
- Tailwind CSS for custom styling
- Responsive grid layout
- Smooth transitions and hover effects

## Dependencies

- `antd` - UI components
- `react-toastify` - Toast notifications
- `@reduxjs/toolkit` - State management and API calls
- Existing media API and review API

## Future Enhancements

Potential improvements:

1. Add ability to reorder images
2. Set primary/featured review image
3. Add captions or descriptions to review images
4. Bulk operations (add same images to multiple products)
5. Image cropping/editing before submission
6. Preview how images will appear on the frontend
