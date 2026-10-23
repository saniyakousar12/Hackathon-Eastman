# Field reference for Backend and Frontend

Money fields are `Decimal(10,2)` (PostgreSQL NUMERIC). Prisma returns them as `Decimal` objects, which
serialise to **strings** in JSON (e.g. `"1999"`). Convert in the API layer (for
example `.toFixed(2)`) and agree on one format with the frontend.

| Model | Fields |
|---|---|
| User | id, fullName, email, passwordHash (never expose), createdAt, updatedAt |
| Category | id, name, description |
| Product | id, sku, name, description, categoryId, brand, price, originalPrice?, imageUrl, rating?, stockQuantity, isAvailable, createdAt, updatedAt |
| Cart | id, userId, createdAt, updatedAt |
| CartItem | id, cartId, productId, quantity (unique per cartId+productId) |
| Coupon | id, code, description?, discountType (PERCENTAGE/FIXED), discountValue, minPurchase, maxDiscount?, startsAt, expiresAt, usageLimit?, perUserLimit?, usedCount, eligibleCategoryId?, firstOrderOnly, isActive |
| CouponUsage | id, couponId, userId, orderId?, usedAt |
| RewardRule | id, code, minSpend, rewardType (PERCENT_OFF/FLAT_OFF/FREE_DELIVERY), rewardValue, description?, isActive |
| UserReward | id, userId, rewardRuleId, status (UNLOCKED/REDEEMED/EXPIRED), unlockedAt, redeemedAt? |
| UserPreference | id, userId, shoppingPreference?, budgetPreference?, selectedCategories[], updatedAt |
| Order | id, orderNumber, userId, status (PENDING/CONFIRMED/PACKED/SHIPPED/DELIVERED/CANCELLED), subtotal, productDiscount, couponDiscount, rewardDiscount, deliveryCharge, finalAmount, couponCode?, deliveryName, deliveryPhone, deliveryAddress, deliveryCity, deliveryState, deliveryPincode, createdAt, updatedAt |
| OrderItem | id, orderId, productId, productName, unitPrice, quantity, lineTotal |
| PasswordResetToken | id, userId, tokenHash, expiresAt, usedAt?, createdAt (store a SHA-256 hash, never the raw token) |

## Order creation (backend, one transaction)

1. Load cart items and current product prices.
2. Re-validate stock, coupon, and reward; compute totals with `Prisma.Decimal`.
3. In `prisma.$transaction`: create Order + OrderItems (with name/price snapshots),
   decrement stock with a guarded update (`stockQuantity >= qty`), create
   CouponUsage and increment `Coupon.usedCount`, mark UserReward REDEEMED,
   clear the cart items.
4. If any step fails, the transaction rolls back.
