# Auto SMS & Call Center Follow-Up — Admin UI Documentation

## Table of Contents

1. [Auto SMS](#1-auto-sms)
   - [Where to find it](#11-where-to-find-it)
   - [Permissions required](#12-permissions-required)
   - [Rule list page](#13-rule-list-page)
   - [Create / Edit rule form](#14-create--edit-rule-form)
   - [How to create a rule for immediate SMS after order](#15-how-to-create-a-rule-for-immediate-sms-after-order)
   - [Redux / API hooks](#16-redux--api-hooks)
2. [Call Center Follow-Up](#2-call-center-follow-up)
   - [Where to find it](#21-where-to-find-it)
   - [Permissions required](#22-permissions-required)
   - [Dashboard page](#23-dashboard-page)
   - [Call history drawer](#24-call-history-drawer)
   - [Order detail page](#25-order-detail-page)
   - [Follow-up form (shared component)](#26-follow-up-form-shared-component)
   - [Redux / API hooks](#27-redux--api-hooks)

---

## 1. Auto SMS

### 1.1 Where to find it

**Navigation:** Marketing → Auto SMS  
**Route:** `/marketing/auto-sms`  
**Files:**
```
src/pages/Marketing/AutoSms/
  AutoSmsList.tsx       — list page
  SmsRuleModal.tsx      — create/edit modal

src/redux/features/autoSms/
  autoSmsApi.ts         — RTK Query endpoints
  autoSmsSlice.ts       — (if present) local state
```

---

### 1.2 Permissions required

| Action | Permission |
|---|---|
| View rule list | `Auto SMS → view` |
| Create a rule | `Auto SMS → create` |
| Edit a rule | `Auto SMS → update` |
| Delete a rule | `Auto SMS → delete` |

Configure permissions via **Settings → Designations → Permissions**.

---

### 1.3 Rule list page

`AutoSmsList.tsx`

The page shows all SMS rules in a table with these columns:

| Column | Notes |
|---|---|
| Rule Name | Display name set when creating the rule |
| Type | Badge: **After Purchase** or **Before Expiry** |
| Apply To | Badge: **All Products** or **Selected** |
| Status | Toggle ON/OFF — calls `PATCH /api/auto-sms/:id` with `{ isActive }` inline |
| Actions | Edit icon (opens modal pre-filled), Delete icon (confirmation dialog) |

- The **Create Rule** button appears only when the user has `create` permission.
- Deleting a rule also deletes all its queue entries (handled server-side).
- Editing a rule clears all its `pending` queue entries so the cron re-evaluates from scratch.

---

### 1.4 Create / Edit rule form

`SmsRuleModal.tsx`

Opens as a modal. All fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| **Name** | Text | Yes | Descriptive label, e.g. "Order Confirmation" |
| **Type** | Dropdown | Yes | After Purchase / Before Expiry |
| **Duration Days** | Number (≥ 0) | Yes | See rule type guide below |
| **Send Time** | Time picker (HH:mm) | No | Leave blank for immediate send. If set, SMS is scheduled for that Dhaka local time on the target day. |
| **Message** | Textarea | Yes | Supports placeholders (see below) |
| **Apply To** | Dropdown | Yes | All Products / Selected Products |
| **Status** | Toggle | No | Default ON |
| **Selected Products** | Multi-select | If `applyTo=selected` | At least one required. Shows both regular products and combo products, labeled `[Product]` / `[Combo]` |
| **Exclude Products** | Multi-select | No | Only shown when `applyTo=all`. Any order containing an excluded product is skipped. |

#### Message placeholders

Type these directly in the message field:

| Placeholder | What it outputs |
|---|---|
| `{{name}}` | Customer's full name |
| `{{order_id}}` | Last 8 characters of the order ID (uppercase) |
| `{{Product Name}}` | Comma-separated product names from the order |

Example message:
```
Hi {{name}}, your order #{{order_id}} has been confirmed. Products: {{Product Name}}. Thank you!
```

#### Duration Days guide

**For `after_purchase`:**

| Duration Days | When SMS is sent |
|---|---|
| `0` | Within 1 minute of order creation (immediate) |
| `1` | The day after the order was placed |
| `2` | Two days after the order |
| `N` | N days after the order |

**For `before_expiry`:**

| Duration Days | When SMS is sent |
|---|---|
| `3` | 3 days before the product/service expires |
| `7` | 1 week before expiry |
| `1` | The day before expiry |

Expiry is based on the variant's `durationDays` field (service period). Orders without variants that have `durationDays` set will be ignored by this rule type.

---

### 1.5 How to create a rule for immediate SMS after order

This is the most common use case — send a confirmation SMS within 1–2 minutes of every new order.

1. Click **Create Rule**
2. Fill in:
   - **Name:** `Order Confirmation`
   - **Type:** `After Purchase`
   - **Duration Days:** `0`
   - **Send Time:** leave blank (empty)
   - **Message:** `Hi {{name}}, your order #{{order_id}} is confirmed. Thank you!`
   - **Apply To:** `All Products`
   - **Status:** ON
3. Click Save

The cron runs every minute. As soon as an order is created, the next cron tick will create a queue entry with `scheduledAt` in the past, and the dispatcher sends it immediately in the same tick. Total delay: **under 2 minutes**.

> **Important:** Do not set a Send Time for `durationDays=0` rules. If a time is stored, the SMS will be delayed until that time of day (e.g. if Send Time is `23:59`, the SMS won't go out until midnight).

---

### 1.6 Redux / API hooks

File: `src/redux/features/autoSms/autoSmsApi.ts`

```typescript
// Read
useGetSmsRulesQuery()                      // list all rules
useGetSingleSmsRuleQuery(id: string)       // single rule

// Write
useCreateSmsRuleMutation()                 // POST body: ISmsRuleRequest
useUpdateSmsRuleMutation()                 // { id: string, data: Partial<ISmsRuleRequest> }
useDeleteSmsRuleMutation()                 // id: string
```

---

## 2. Call Center Follow-Up

### 2.1 Where to find it

**Navigation:** Marketing → Call Center  
**Routes:**
- `/marketing/call-center` — main dashboard
- `/marketing/call-center/:orderId` — per-order detail page
- `/orders/:orderId/follow-up` — follow-up tab on the order management page

**Files:**
```
src/pages/Marketing/CallCenter/
  CallCenterFollowups.tsx     — dashboard list
  CallCenterOrderDetail.tsx   — per-order detail page
  CallHistoryDrawer.tsx       — slide-in drawer (history + order summary)
  AddFollowUpModal.tsx        — shared form modal

src/pages/Orders/
  OrderFollowUp.tsx           — follow-up panel within order management
```

---

### 2.2 Permissions required

| Action | Permission |
|---|---|
| View call center dashboard | `Call Center Follow-ups → view` |
| View order detail page | `Call Center Follow-ups → view` |
| Add a follow-up | `Orders → update` |

---

### 2.3 Dashboard page

`CallCenterFollowups.tsx` — route `/marketing/call-center`

#### Summary cards (top of page)

Four clickable cards that also act as filters:

| Card | Color | Clicking it |
|---|---|---|
| Due Today | Orange | Filters table to `followUpFilter=due_today` |
| Overdue | Red | Filters table to `followUpFilter=overdue` |
| Upcoming | Blue | Filters table to `followUpFilter=upcoming` |
| No Follow-up | Gray | Filters table to `followUpFilter=no_followup` |

The counts shown on the cards come from the `summary` field in the API response and update on every fetch.

#### Filters

- **Search bar** — filters by customer name or phone number
- **Order Status** dropdown — `PENDING`, `HOLD`, `CONFIRM`, `SHIPPED`, `DELIVERED`, `CANCELLED`
- **Follow-up Status** dropdown — Due Today, Overdue, Upcoming, No Follow-up

#### Table columns

| Column | Contents |
|---|---|
| Customer | Name + phone. Phone has quick-action buttons: Call (tel: link), WhatsApp |
| Order | Short order ID, status badge, creation date |
| Products | First 2 products with variant info and quantity |
| Amount | Order total |
| Follow-up Status | Colored badge (Overdue / Due Today / Upcoming / No Follow-up) + date of next scheduled follow-up |
| Last Call Note | Most recent note text + when it was logged and by whom |
| Actions | **Schedule Follow-up** button, **View Call History** button |

**Row sort order:** Overdue → Due Today → Upcoming → No Follow-up. Within each group, sorted by `followUpDate` ascending.

---

### 2.4 Call history drawer

`CallHistoryDrawer.tsx` — opens from "View Call History" on any row

A side drawer with two tabs:

#### Tab 1 — Call History

- **Schedule Next Follow-up** form at the top (date/time picker + notes)
- **Follow-up history** list below, grouped by:
  - Overdue (past, not completed)
  - Due Today
  - Upcoming
- Each entry shows: scheduled date/time, notes, logged by (name), logged at (timestamp)

#### Tab 2 — Order History

Pulls all orders for this customer (by customer ID or phone):

- Summary row: Total Orders / Delivered / Cancelled / Total Spent
- Each order listed with: Order ID, status badge, first 3 products, total, creation date
- Expandable: follow-ups attached to each individual order

---

### 2.5 Order detail page

`CallCenterOrderDetail.tsx` — route `/marketing/call-center/:orderId`

Shows the full follow-up history for one specific order:

- **Customer info bar** at top: name, phone (Call/WhatsApp buttons), order status, total amount
- **Follow-up table**: Scheduled Date & Time, Call Notes, Logged By (name + email), Logged At
- **Schedule Follow-up** button (top right) — opens `AddFollowUpModal`

---

### 2.6 Follow-up form (shared component)

`AddFollowUpModal.tsx` — used in OrderFollowUp, CallCenterOrderDetail, and CallHistoryDrawer

| Field | Type | Required | Notes |
|---|---|---|---|
| **Follow-up Date** | DateTime picker | Yes | Date and time of the scheduled call |
| **Description** | Textarea | Yes | Call notes, reason for follow-up, outcome |

On submit: calls `POST /api/orders/:orderId/follow-up` and refreshes the parent list.

---

### 2.7 Redux / API hooks

File: `src/redux/features/order/orderApi.ts`

```typescript
// Follow-ups
useGetFollowUpsQuery(orderId: string)
useAddFollowUpMutation()
// usage: addFollowUp({ orderId, data: { followUpDate, description } })

// Call center dashboard
useGetCallCenterFollowupsQuery(queryArgs: { name: string, value: any }[])
// queryArgs example: [{ name: "page", value: 1 }, { name: "followUpFilter", value: "overdue" }]

// Customer order history (drawer Tab 2)
useGetCustomerOrdersQuery({ customerId?: string, phone?: string })

// Order locking (on the Orders follow-up page for HOLD status orders)
useGetLockStatusQuery(orderId: string)    // polled every 5s
useLockOrderMutation()
useRefreshLockMutation()
useUnlockOrderMutation()
```

#### Order lock behavior

On the `OrderFollowUp` page, if an order has status `HOLD`:
- The order is **locked** when the page opens (`POST /orders/:id/lock`)
- Lock is refreshed every 5 seconds (`PATCH /orders/:id/lock/refresh`)
- Lock is released when the user navigates away (`DELETE /orders/:id/lock`)
- If another agent has the order locked, a warning is shown and edits are blocked

This prevents two agents from editing the same hold order simultaneously.
