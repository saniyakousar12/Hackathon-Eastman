/**
 * CartNova seed script.
 * Idempotent: every record is upserted on a unique key, so running this
 * repeatedly never creates duplicates.
 * All data is fictional. The demo user uses a dummy password from .env.
 */
const { PrismaClient, Prisma } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const D = (n) => new Prisma.Decimal(n);
const daysFromNow = (n) => new Date(Date.now() + n * 86400000);
const img = (seed) => `https://picsum.photos/seed/${seed}/600/600`;

const categories = [
  { name: "Electronics", description: "Phones, audio, and accessories" },
  { name: "Fashion", description: "Clothing, footwear, and accessories" },
  { name: "Home & Kitchen", description: "Appliances and home essentials" },
  { name: "Books", description: "Fiction, non-fiction, and learning" },
  { name: "Sports & Fitness", description: "Gear for staying active" },
];

// [sku, name, category, brand, price, originalPrice, rating, stock, description]
const products = [
  ["ELE-001", "Wireless Bluetooth Earbuds", "Electronics", "SoundWave", 1999, 2999, 4.3, 120, "Noise-reducing earbuds with 24-hour battery life."],
  ["ELE-002", "20000mAh Power Bank", "Electronics", "ChargeUp", 1499, 1999, 4.4, 80, "Fast-charging power bank with dual USB ports."],
  ["ELE-003", "Smart Fitness Band", "Electronics", "FitPulse", 2499, 3499, 4.1, 60, "Heart-rate, sleep, and step tracking."],
  ["ELE-004", "Over-Ear Headphones", "Electronics", "SoundWave", 3499, 4999, 4.5, 40, "Comfortable studio-quality wireless headphones."],
  ["ELE-005", "Portable Bluetooth Speaker", "Electronics", "BoomBox", 2799, 3999, 4.2, 55, "Waterproof speaker with deep bass."],
  ["ELE-006", "Mechanical Keyboard", "Electronics", "KeyCraft", 4299, 5499, 4.6, 30, "Hot-swappable mechanical keyboard with RGB lighting."],
  ["FAS-001", "Men's Cotton T-Shirt", "Fashion", "UrbanThread", 499, 799, 4.0, 200, "Soft breathable everyday cotton tee."],
  ["FAS-002", "Women's Denim Jacket", "Fashion", "UrbanThread", 1799, 2499, 4.2, 70, "Classic fit denim jacket."],
  ["FAS-003", "Running Shoes", "Fashion", "StrideX", 2999, 4499, 4.4, 90, "Lightweight cushioned running shoes."],
  ["FAS-004", "Leather Wallet", "Fashion", "CraftHide", 899, 1299, 4.3, 150, "Slim genuine leather wallet."],
  ["HOM-001", "Non-Stick Cookware Set", "Home & Kitchen", "ChefMate", 2499, 3999, 4.1, 45, "3-piece non-stick cookware set."],
  ["HOM-002", "Electric Kettle 1.5L", "Home & Kitchen", "HeatWell", 899, 1299, 4.2, 110, "Stainless steel kettle with auto shut-off."],
  ["HOM-003", "Mixer Grinder 750W", "Home & Kitchen", "ChefMate", 3299, 4599, 4.4, 35, "Three-jar mixer grinder."],
  ["HOM-004", "Memory Foam Pillow", "Home & Kitchen", "SleepWell", 799, 1199, 4.0, 130, "Ergonomic pillow for neck support."],
  ["HOM-005", "LED Desk Lamp", "Home & Kitchen", "BrightCo", 1199, 1699, 4.3, 75, "Adjustable lamp with three light modes."],
  ["BOK-001", "Atomic Habits", "Books", "Penguin", 399, 599, 4.8, 300, "A guide to building good habits."],
  ["BOK-002", "The Psychology of Money", "Books", "Jaico", 349, 499, 4.7, 250, "Timeless lessons on wealth and behavior."],
  ["BOK-003", "Clean Code", "Books", "Pearson", 1299, 1799, 4.6, 60, "A handbook of agile software craftsmanship."],
  ["SPO-001", "Yoga Mat 6mm", "Sports & Fitness", "FlexFit", 699, 999, 4.2, 140, "Non-slip anti-tear yoga mat."],
  ["SPO-002", "Adjustable Dumbbell Set", "Sports & Fitness", "IronCore", 3999, 5499, 4.5, 25, "Adjustable dumbbells up to 20 kg."],
  ["SPO-003", "Badminton Racket Pair", "Sports & Fitness", "SmashPro", 1599, 2299, 4.1, 65, "Two lightweight rackets with cover."],
  ["SPO-004", "Insulated Steel Bottle 1L", "Sports & Fitness", "FlexFit", 599, 899, 4.4, 180, "Keeps drinks cold for 24 hours."],
];

async function main() {
  // Categories
  const catMap = {};
  for (const c of categories) {
    const row = await prisma.category.upsert({
      where: { name: c.name },
      update: { description: c.description },
      create: c,
    });
    catMap[c.name] = row.id;
  }

  // Products (upserted by SKU; re-seeding resets price and stock to seed values)
  for (const [sku, name, cat, brand, price, orig, rating, stock, description] of products) {
    const data = {
      name,
      description,
      brand,
      categoryId: catMap[cat],
      price: D(price),
      originalPrice: D(orig),
      rating: D(rating),
      stockQuantity: stock,
      isAvailable: stock > 0,
      imageUrl: img(sku),
    };
    await prisma.product.upsert({ where: { sku }, update: data, create: { sku, ...data } });
  }

  // Coupons (valid, min-spend, fixed, percentage, category-specific, expired)
  const coupons = [
    { code: "WELCOME10", description: "10% off, up to ₹500 (first order)", discountType: "PERCENTAGE", discountValue: D(10), minPurchase: D(999), maxDiscount: D(500), startsAt: daysFromNow(-30), expiresAt: daysFromNow(365), perUserLimit: 1, firstOrderOnly: true },
    { code: "FLAT200", description: "Flat ₹200 off on orders above ₹1,499", discountType: "FIXED", discountValue: D(200), minPurchase: D(1499), startsAt: daysFromNow(-30), expiresAt: daysFromNow(365) },
    { code: "SAVE15", description: "15% off on orders above ₹2,999, up to ₹1,000", discountType: "PERCENTAGE", discountValue: D(15), minPurchase: D(2999), maxDiscount: D(1000), startsAt: daysFromNow(-30), expiresAt: daysFromNow(365), usageLimit: 1000 },
    { code: "BIG500", description: "Flat ₹500 off on orders above ₹5,000", discountType: "FIXED", discountValue: D(500), minPurchase: D(5000), startsAt: daysFromNow(-30), expiresAt: daysFromNow(365) },
    { code: "TECH10", description: "10% off Electronics, up to ₹600", discountType: "PERCENTAGE", discountValue: D(10), minPurchase: D(1000), maxDiscount: D(600), startsAt: daysFromNow(-30), expiresAt: daysFromNow(365), eligibleCategoryId: catMap["Electronics"] },
    { code: "EXPIRED50", description: "Expired test coupon", discountType: "FIXED", discountValue: D(50), minPurchase: D(0), startsAt: daysFromNow(-90), expiresAt: daysFromNow(-30) },
  ];
  for (const c of coupons) {
    // `update` deliberately keeps usedCount and the validity dates intact on re-seed
    const { startsAt, expiresAt, ...rest } = c;
    await prisma.coupon.upsert({ where: { code: c.code }, update: rest, create: c });
  }

  // Reward rules: configurable thresholds of 3000, 5000, 8000
  const rules = [
    { code: "REWARD_3000", minSpend: D(3000), rewardType: "FREE_DELIVERY", rewardValue: D(0), description: "Free delivery on your next order" },
    { code: "REWARD_5000", minSpend: D(5000), rewardType: "FLAT_OFF", rewardValue: D(250), description: "₹250 off your next order" },
    { code: "REWARD_8000", minSpend: D(8000), rewardType: "PERCENT_OFF", rewardValue: D(5), description: "5% off your next order" },
  ];
  for (const r of rules) {
    await prisma.rewardRule.upsert({ where: { code: r.code }, update: r, create: r });
  }

  // Demo user (dummy credentials, development only)
  const hash = await bcrypt.hash(process.env.SEED_DEMO_PASSWORD || "ChangeMe-Dev-Only", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo.user@cartnova.test" },
    update: {},
    create: { fullName: "Demo User", email: "demo.user@cartnova.test", passwordHash: hash },
  });
  await prisma.cart.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
