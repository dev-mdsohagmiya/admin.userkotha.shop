# Review Management implementation

I have implemented a full review management system for the admin panel.

## Changes Made

### `src/redux/features/review/reviewApi.ts`

- Added endpoints:
  - `getAllReviews`
  - `confirmReview`
  - `unconfirmReview`
  - `deleteReviewData`
  - `updateReviewData`
- Exported corresponding hooks.

### `src/pages/Reviews/ReviewList.tsx`

- Created a new page `ReviewList` to display all reviews.
- Implemented filtering, searching, and pagination.
- Added actions to Confirm, Unconfirm, Delete, and Update reviews.
- Used `DataTable` for display.

### `src/pages/Reviews/UpdateReviewModal.tsx`

- Created a modal component to update review details (Name, Rating, Content).

### `src/routes/routes.tsx`

- Added `/reviews` route mapped to `ReviewList` component.

### `src/components/common/Layouts/Sidebar.tsx`

- Added "Reviews" item under "Product Management" section.

## Verification

### Manual Verification Steps

1. **View Reviews**:
   - Navigate to `/reviews` (or click "Reviews" in sidebar).
   - Ensure list of reviews loads.
2. **Review Actions**:
   - Click "Confirm" / "Unconfirm" to toggle status.
   - Click "Delete" to remove a review.
   - Click "Update" to modify review content/rating.
3. **Filtering**:
   - Test searching by text.
