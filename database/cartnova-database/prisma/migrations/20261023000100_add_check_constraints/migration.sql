-- Integrity constraints that Prisma cannot express in schema.prisma.
-- The backend must still validate stock, quantity, and totals.

ALTER TABLE "products"
  ADD CONSTRAINT "chk_products_price" CHECK ("price" >= 0),
  ADD CONSTRAINT "chk_products_stock" CHECK ("stockQuantity" >= 0);

ALTER TABLE "cart_items"
  ADD CONSTRAINT "chk_cart_items_qty" CHECK ("quantity" > 0);

ALTER TABLE "order_items"
  ADD CONSTRAINT "chk_order_items_qty" CHECK ("quantity" > 0);

ALTER TABLE "orders"
  ADD CONSTRAINT "chk_orders_final" CHECK ("finalAmount" >= 0);
