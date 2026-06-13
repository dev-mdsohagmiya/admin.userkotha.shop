# Redux Feature Flow — Create, Update, Delete (RTK Query)

এই প্রজেক্টে বেশিরভাগ **REST API** একই প্যাটার্নে **`src/redux/api/baseApi.ts`** এর ভিতরে **`injectEndpoints`** দিয়ে যুক্ত করা হয়। একটা **resource** (যেমন Units, Brands, Materials) এর জন্য সাধারণত:

- **GET** → `builder.query` → লিস্ট / সিঙ্গেল ডিটেইls  
- **POST** → `builder.mutation` → **create**  
- **PATCH / PUT** → `builder.mutation` → **update** বা স্ট্যাটাস  
- **DELETE** → `builder.mutation` → **delete**

নিচে **`unitsApi.ts`** কে রেফারেন্স ধরে পুরো ফ্লো বোঝানো হয়েছে — অন্য `*Api.ts` ফাইলগুলো একই ধরনের, শুধু `url`, `tag`, ও পেয়লোড আলাদা।

---

## 1. `baseApi` — একটাই API ক্লায়েন্ট

**ফাইল:** `src/redux/api/baseApi.ts`

- `createApi({ reducerPath: "baseApi", baseQuery, tagTypes: [...], endpoints: () => ({}) })`
- আসল এন্ডপয়েন্টগুলো **খালি না** — প্রতিটা ফিচার ফাইল `baseApi.injectEndpoints({ endpoints: (builder) => ({ ... }) })` দিয়ে যোগ করে।
- **`tagTypes`**: ক্যাশ ইনভ্যালিডেশনের ট্যাগের নাম (যেমন `"units"`). নতুন রিসোর্স এলে এখানে টাইপ যোগ করতে হয়।

HTTP কলের সময় **Bearer token**, **X-Client-Details** ইত্যাদি `prepareHeaders` থেকে যায় (আলাদা ডক: `PROJECT_FLOW_AND_ARCHITECTURE_REPORT.md` §5)।

---

## 2. Units — সম্পূর্ণ CRUD ম্যাপিং (API কেমন)

**ফাইল:** `src/redux/features/units/unitsApi.ts`

| কাজ | RTK টাইপ | HTTP | URL (relative to `VITE_PUBLIC_API_URL`) | ক্যাশ |
|-----|-----------|------|------------------------------------------|--------|
| লিস্ট | `unitList` → `useUnitListQuery` | GET | `/units?...` | `providesTags: ["units"]` |
| একটির ডিটেইls | `getUnitById` → `useGetUnitByIdQuery` | GET | `/units/:id` | `providesTags: ["units"]` |
| তৈরি | `createUnit` → `useCreateUnitMutation` | POST | `/units` | `invalidatesTags: ["units"]` |
| আপডেট | `updateUnit` → `useUpdateUnitMutation` | PATCH | `/units/:id` | `invalidatesTags: ["units"]` |
| ডিলিট | `deleteUnit` → `useDeleteUnitMutation` | DELETE | `/units/:id` | `invalidatesTags: ["units"]` |
| স্ট্যাটাস টগল | `updateUnitStatus` → `useUpdateUnitStatusMutation` | PATCH | `units/:id/toggle-status` | `invalidatesTags: ["units"]` |

**মানে:** লিস্ট/গেট কোয়েরি **`providesTags: ["units"]`** দেয় → মিউটেশন **`invalidatesTags: ["units"]`** করলে সব `units` ট্যাগযুক্ত কোয়েরি আবার রিফেচ হয়। তাই UI তে লিস্ট আপডেটেড লাগে **ম্যানুয়ালি স্টেট সেট না করেই**।

---

## 3. পেজ / কম্পোনেন্টে ব্যবহার (লাইভ ফ্লো)

১. **লিস্ট পেজ** (যেমন `UnitsList.tsx`):  
   `useUnitListQuery([{ name: "isActive", value: "true" }, ...])`  
   → আর্গুমেন্ট অ্যারে থেকে `URLSearchParams` বানিয়ে GET।

২. **Create মোডাল**:  
   `const [createUnit, { isLoading }] = useCreateUnitMutation()`  
   `await createUnit(payload).unwrap()`  
   → সাকসেস হলে ট্যাগ ইনভ্যালিড → লিস্ট কোয়েরি auto refetch।

৩. **Update**:  
   `updateUnit({ id, data }).unwrap()`  
   → PATCH body = `data`।

৪. **Delete**:  
   `deleteUnit(id).unwrap()`  
   → DELETE।

৫. **টোস্ট / এরর**: গ্লোবালি `baseQuery` এররে `toast` হতে পারে; পেজে `try/catch` দিয়ে `toast.success` দেওয়া কমন।

**রাউট vs Redux:**  
রাউট (`/units`) শুধু কোন **পেজ** খুলবে বলে। **Create/Update/Delete** বেশিরভাগ সময় **একই রাউটে** মোডাল বা ড্রয়ারে — আলাদা URL লাগে না। কিছু ফিচারে আলাদা পেজ আছে (যেমন `/create-product`) — সেখানে ফর্ম সাবমিটেই `useCreateProductMutation`।

---

## 4. নতুন ফিচারে একই ফ্লো যোগ করার চেকলিস্ট

1. **`baseApi.ts` এর `tagTypes` এ নতুন স্ট্রিং** (যেমন `"myResource"`) যোগ করো।  
2. **`src/redux/features/<name>/<name>Api.ts`** ফাইলে `baseApi.injectEndpoints({ ... })`।  
3. **Query:** `providesTags: ["myResource"]` (বা `{ type, id }` গ্রানুলার যদি লাগে)।  
4. **Mutation:** `invalidatesTags: ["myResource"]` (বা `invalidatesTags: (result, error, arg) => [...]`)।  
5. **পেজে** জেনারেটেড হুক ইমপোর্ট — ফাইলের নিচে `export const { useXQuery, useYMutation } = ...` থাকে।  
6. প্রয়োজনে **`main.tsx`** তে side-effect ইমপোর্ট (কিছু প্রজেক্টে আছে) যেন এন্ডপয়েন্ট রেজিস্টার থাকে।

---

## 5. অন্য মডিউলে পার্থক্য (সংক্ষেপে)

- **অনেক লিস্ট** একই ট্যাগ `"products"` — ইনভ্যালিড করলে পুরো প্রোডাক্ট ক্যাশ ঝরে; কখনো **`{ type: "products", id: LIST_ID }`** প্যাটার্ন ব্যবহার করা হয় গ্রানুলার আপডেটের জন্য।  
- **ফাইল আপলোড**: `body: FormData` + `Content-Type` ছাড়া `fetch` (ব্রাউজার boundary দেয়)।  
- **`reportApi`**: বেশি **read-only query**; মিউটেশন কম।

---

## 6. রিলেটেড ফাইল

| ফাইল | দায়িত্ব |
|------|---------|
| `src/redux/api/baseApi.ts` | `createApi`, `tagTypes`, `baseQueryWithRefreshToken` |
| `src/redux/features/store.ts` | `baseApi.middleware` + `reducer` |
| `src/redux/features/<feature>/*Api.ts` | ডোমেইন-wise `injectEndpoints` |
| `src/config/index.ts` | `VITE_PUBLIC_API_URL` → বেস URL |

পুরো অ্যাপ ওভারভিউ: **`docs/PROJECT_FLOW_AND_ARCHITECTURE_REPORT.md`**।
