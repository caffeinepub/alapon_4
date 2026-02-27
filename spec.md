# Alapon

## Current State
Fresh workspace. Rebuilding Alapon PWA from scratch based on previous build history.

## Requested Changes (Diff)

### Add
- Social feed with posts (like, comment, share), stories bar, injected ad cards every 4th post
- Video feed screen with 2-column grid and pre-roll ad overlay (countdown + skip)
- Shop screen with product listings, product detail view, add-to-cart, cart, checkout flow
- Sponsored posts support (visual badge on post cards)
- Ad Revenue Dashboard (admin only): KPI cards (impressions, clicks, CTR, revenue), campaign table with activate/pause/complete controls
- Campaign Creator form: title, budget, image URL, target URL
- Profile tab with "Make Me Admin" button to unlock admin features
- Bottom navigation: Feed, Videos, Shop, Profile
- PWA manifest and mobile-first layout

### Modify
- N/A (new build)

### Remove
- N/A (new build)

## Implementation Plan
1. Backend: users, posts, videos, ad campaigns, shop products, orders, cart
2. Backend: admin role management, revenue stats tracking
3. Frontend: App shell with bottom nav (Feed, Videos, Shop, Profile)
4. Frontend: Feed screen -- stories bar, post cards, injected ad cards
5. Frontend: Video screen -- 2-col grid, pre-roll ad overlay with countdown
6. Frontend: Shop screen -- product grid, product detail modal, cart drawer, checkout
7. Frontend: Ad Revenue Dashboard (admin only) -- KPIs + campaign table + campaign creator
8. Frontend: Profile screen -- user info, admin toggle
9. PWA manifest
