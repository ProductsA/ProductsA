import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import { products as electronicsProducts } from "./seed/electronics";
import { products as foodProducts } from "./seed/food";
import { products as fashionProducts } from "./seed/fashion";
import { products as homeProducts } from "./seed/home";
import { products as servicesProducts } from "./seed/services";
import { products as beautyProducts } from "./seed/beauty";
import { products as sportsProducts } from "./seed/sports";
import { products as booksProducts } from "./seed/books";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...\n");

  // ── Cleanup existing data (except Admin) ───────────────────────────
  console.log("Clearing existing data (except admin)...");
  await prisma.notification.deleteMany();
  await prisma.websiteSetting.deleteMany();
  await prisma.customFieldValue.deleteMany();
  await prisma.customField.deleteMany();
  await prisma.customerRequest.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.productVariation.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  console.log(`  ✓ Existing data cleared\n`);

  // ── 1. Admin Account ──────────────────────────────────────────────
  console.log("Creating admin account...");
  const passwordHash = await bcrypt.hash("admin123", 10);
  const admin = await prisma.admin.upsert({
    where: { email: "admin@store.com" },
    update: {},
    create: {
      name: "Admin Store",
      email: "admin@store.com",
      phone: "+212 600 000 000",
      passwordHash,
    },
  });
  console.log(`  ✓ Admin: ${admin.name} (${admin.email})`);

  // ── 2. Categories ─────────────────────────────────────────────────
  console.log("\nCreating categories...");
  const categoriesData = [
    {
      name: "Electronics",
      slug: "electronics",
      description:
        "Smartphones, laptops, tablets, headphones and the latest tech gadgets from top brands.",
    },
    {
      name: "Food & Groceries",
      slug: "food-groceries",
      description:
        "Authentic Moroccan argan oil, dates, saffron, teas and premium grocery products.",
    },
    {
      name: "Fashion & Clothing",
      slug: "fashion-clothing",
      description:
        "Traditional caftans, sneakers, rugs and handcrafted fashion pieces with Moroccan soul.",
    },
    {
      name: "Home & Kitchen",
      slug: "home-kitchen",
      description:
        "Tagines, lanterns, air purifiers and everything to make your home beautiful and healthy.",
    },
    {
      name: "Services",
      slug: "services",
      description:
        "Professional photography, home cleaning and other quality services booked with confidence.",
    },
    {
      name: "Beauty & Health",
      slug: "beauty-health",
      description:
        "Natural beauty sets, black soap, argan skincare and wellness products made in Morocco.",
    },
    {
      name: "Sports & Outdoors",
      slug: "sports-outdoors",
      description:
        "Running shoes, fitness gear and outdoor equipment for every athlete and adventurer.",
    },
    {
      name: "Books & Stationery",
      slug: "books-stationery",
      description:
        "Bestselling books, journals, pens and premium stationery collections for work and study.",
    },
  ];

  const categories: Record<string, { id: number }> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
    categories[cat.slug] = created;
    console.log(`  ✓ ${created.name}`);
  }

  // ── 3. Products (from category modules) ───────────────────────────
  const categoryProductMap: Record<
    string,
    {
      name: string;
      slug: string;
      description: string;
      shortDescription: string;
      price: number;
      discountPrice: number | null;
      mainImage: string;
      images: string[];
      featured: boolean;
      specifications: { [key: string]: string | undefined };
    }[]
  > = {
    electronics: electronicsProducts,
    "food-groceries": foodProducts,
    "fashion-clothing": fashionProducts,
    "home-kitchen": homeProducts,
    services: servicesProducts,
    "beauty-health": beautyProducts,
    "sports-outdoors": sportsProducts,
    "books-stationery": booksProducts,
  };

  const createdProducts: { id: number; name: string; slug: string }[] = [];

  for (const [categorySlug, moduleProducts] of Object.entries(
    categoryProductMap
  )) {
    const categoryId = categories[categorySlug].id;
    console.log(`\nCreating products for ${categorySlug}...`);

    for (const product of moduleProducts) {
      const specifications = JSON.stringify(product.specifications);

      const created = await prisma.product.upsert({
        where: { slug: product.slug },
        update: {
          name: product.name,
          description: product.description,
          shortDescription: product.shortDescription,
          price: product.price,
          discountPrice: product.discountPrice,
          mainImage: product.mainImage,
          featured: product.featured,
          specifications,
        },
        create: {
          name: product.name,
          slug: product.slug,
          description: product.description,
          shortDescription: product.shortDescription,
          price: product.price,
          discountPrice: product.discountPrice,
          categoryId,
          mainImage: product.mainImage,
          featured: product.featured,
          specifications,
          status: true,
          isVisible: true,
        },
      });
      createdProducts.push({
        id: created.id,
        name: created.name,
        slug: created.slug,
      });

      // Product images from the module data
      await prisma.productImage.createMany({
        data: product.images.map((url, idx) => ({
          imageUrl: url,
          sortOrder: idx,
          productId: created.id,
        })),
      });

      console.log(
        `  ✓ ${created.name} — ${product.images.length} images`
      );
    }
  }

  // ── 4. Product Variations ─────────────────────────────────────────
  console.log("\nCreating product variations...");

  const variationSets: Record<
    string,
    { variationName: string; variationValue: string }[]
  > = {
    "iphone-15-pro-max": [
      { variationName: "Color", variationValue: "Black" },
      { variationName: "Color", variationValue: "Blue" },
      { variationName: "Color", variationValue: "Titanium" },
      { variationName: "Storage", variationValue: "256GB" },
      { variationName: "Storage", variationValue: "512GB" },
      { variationName: "Storage", variationValue: "1TB" },
    ],
    "samsung-galaxy-s24-ultra": [
      { variationName: "Color", variationValue: "Black" },
      { variationName: "Color", variationValue: "Gray" },
      { variationName: "Color", variationValue: "Violet" },
      { variationName: "Storage", variationValue: "256GB" },
      { variationName: "Storage", variationValue: "512GB" },
    ],
    "macbook-air-m3": [
      { variationName: "RAM", variationValue: "8GB" },
      { variationName: "RAM", variationValue: "16GB" },
      { variationName: "Storage", variationValue: "256GB" },
      { variationName: "Storage", variationValue: "512GB" },
      { variationName: "Storage", variationValue: "1TB" },
    ],
    "sony-wh-1000xm5": [
      { variationName: "Color", variationValue: "Black" },
      { variationName: "Color", variationValue: "Silver" },
      { variationName: "Color", variationValue: "Midnight Blue" },
    ],
    "premium-leather-sneakers": [
      { variationName: "Size", variationValue: "40" },
      { variationName: "Size", variationValue: "41" },
      { variationName: "Size", variationValue: "42" },
      { variationName: "Size", variationValue: "43" },
      { variationName: "Size", variationValue: "44" },
      { variationName: "Size", variationValue: "45" },
      { variationName: "Color", variationValue: "Black" },
      { variationName: "Color", variationValue: "White" },
      { variationName: "Color", variationValue: "Red" },
    ],
    "traditional-moroccan-caftan": [
      { variationName: "Size", variationValue: "S" },
      { variationName: "Size", variationValue: "M" },
      { variationName: "Size", variationValue: "L" },
      { variationName: "Size", variationValue: "XL" },
      { variationName: "Color", variationValue: "Red" },
      { variationName: "Color", variationValue: "Blue" },
      { variationName: "Color", variationValue: "Gold" },
    ],
  };

  for (const product of createdProducts) {
    const variations = variationSets[product.slug];
    if (!variations) continue;

    await prisma.productVariation.createMany({
      data: variations.map((v) => ({ ...v, productId: product.id })),
    });
    console.log(
      `  ✓ ${product.name} — ${variations.length} variations`
    );
  }

  // ── 5. Customers ──────────────────────────────────────────────────
  console.log("\nCreating customers...");

  const customersData = [
    {
      firstName: "Ahmed",
      lastName: "Benali",
      gender: "Male",
      email: "ahmed@example.com",
      phone: "0612345678",
      address: "45 Rue Fes",
      city: "Casablanca",
      region: "Casablanca-Settat",
      postalCode: "20000",
      country: "Morocco",
    },
    {
      firstName: "Fatima Zahra",
      lastName: "El Mansouri",
      gender: "Female",
      email: "fatima@example.com",
      phone: "0698765432",
      address: "12 Avenue Hassan II",
      city: "Rabat",
      region: "Rabat-Sale-Kenitra",
      postalCode: "10000",
      country: "Morocco",
    },
    {
      firstName: "Mohammed",
      lastName: "Alami",
      gender: "Male",
      email: "mohammed@example.com",
      phone: "0655544433",
      address: "78 Boulevard Mohammed V",
      city: "Marrakech",
      region: "Marrakech-Safi",
      postalCode: "40000",
      country: "Morocco",
    },
    {
      firstName: "Sara",
      lastName: "Idrissi",
      gender: "Female",
      email: "sara@example.com",
      phone: "0677788899",
      address: "23 Rue de Tanger",
      city: "Tangier",
      region: "Tanger-Tetouan-Al Hoceima",
      postalCode: "90000",
      country: "Morocco",
    },
    {
      firstName: "Youssef",
      lastName: "Tazi",
      gender: "Male",
      email: "youssef@example.com",
      phone: "0611122233",
      address: "56 Derb El Miter",
      city: "Fez",
      region: "Fes-Meknes",
      postalCode: "30000",
      country: "Morocco",
    },
  ];

  const customers: { id: number; firstName: string; lastName: string }[] = [];

  for (const c of customersData) {
    const created = await prisma.customer.create({ data: c });
    customers.push({
      id: created.id,
      firstName: created.firstName,
      lastName: created.lastName ?? "",
    });
    console.log(`  ✓ ${created.firstName} ${created.lastName}`);
  }

  // ── 6. Customer Requests ──────────────────────────────────────────
  console.log("\nCreating customer requests...");

  const now = new Date();
  const daysAgo = (d: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() - d);
    return date;
  };

  const requestsData = [
    {
      customerId: customers[0].id,
      productId: createdProducts[0].id,
      requestId: `REQ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-0001`,
      variation: "Color: Titanium, Storage: 256GB",
      status: "New",
      notes: `Looking for the best deal on the iPhone 15 Pro Max.`,
      submittedAt: daysAgo(1),
    },
    {
      customerId: customers[1].id,
      productId: createdProducts[1].id,
      requestId: `REQ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-0002`,
      variation: null,
      status: "Contacted",
      notes: `Interested in the extra virgin argan oil for daily cooking.`,
      adminComments: `Sent organic certification documents via WhatsApp.`,
      submittedAt: daysAgo(2),
    },
    {
      customerId: customers[2].id,
      productId: createdProducts[2].id,
      requestId: `REQ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-0003`,
      variation: "Size: L, Color: Gold",
      status: "Confirmed",
      notes: `Need the Traditional Moroccan Caftan for a wedding next month.`,
      adminComments: `Order confirmed. Tailoring arranged in Gold, size L.`,
      submittedAt: daysAgo(3),
    },
    {
      customerId: customers[3].id,
      productId: createdProducts[3].id,
      requestId: `REQ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-0004`,
      variation: null,
      status: "Completed",
      notes: `Bought the ceramic tagine as a housewarming gift.`,
      adminComments: `Delivered on time. Customer satisfied.`,
      submittedAt: daysAgo(4),
    },
    {
      customerId: customers[4].id,
      productId: createdProducts[4].id,
      requestId: `REQ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-0005`,
      variation: null,
      status: "New",
      notes: `Want to book a photography session for a family event.`,
      submittedAt: daysAgo(5),
    },
    {
      customerId: customers[0].id,
      productId: createdProducts[5].id,
      requestId: `REQ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-0006`,
      variation: null,
      status: "Contacted",
      notes: `Asking about the Argan Beauty Set ingredients for sensitive skin.`,
      adminComments: `Explained the formula is dermatologically tested.`,
      submittedAt: daysAgo(6),
    },
    {
      customerId: customers[1].id,
      productId: createdProducts[6].id,
      requestId: `REQ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-0007`,
      variation: null,
      status: "Confirmed",
      notes: `Ordering Running Shoes Pro for marathon training.`,
      adminComments: `Size confirmed. Order confirmed, awaiting payment.`,
      submittedAt: daysAgo(7),
    },
    {
      customerId: customers[2].id,
      productId: createdProducts[7].id,
      requestId: `REQ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-0008`,
      variation: null,
      status: "New",
      notes: `Interested in the Moroccan Travel Journal before an upcoming trip.`,
      submittedAt: daysAgo(8),
    },
    {
      customerId: customers[4].id,
      productId: createdProducts[0].id,
      requestId: `REQ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-0009`,
      variation: "Color: Blue, Storage: 512GB",
      status: "Contacted",
      notes: `Comparing iPhone 15 Pro Max colors before deciding.`,
      adminComments: `Sent comparison photos of Blue vs Titanium.`,
      submittedAt: daysAgo(9),
    },
  ];

  for (const r of requestsData) {
    const created = await prisma.customerRequest.create({ data: r });
    console.log(
      `  ✓ Request #${created.id} (${created.requestId}) — Status: ${created.status}`
    );
  }

  // ── 7. Website Settings ───────────────────────────────────────────
  console.log("\nCreating website settings...");

  const settingsData = [
    { key: "website_name", value: "Souq" },
    { key: "website_description", value: `Votre marketplace marocaine de confiance` },
    { key: "phone", value: "+212 600 000 000" },
    { key: "email", value: "contact@souq.ma" },
    { key: "address", value: "Casablanca, Maroc" },
    { key: "social_facebook", value: "https://facebook.com/souq" },
    { key: "social_instagram", value: "https://instagram.com/souq" },
  ];

  for (const s of settingsData) {
    await prisma.websiteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
    console.log(`  ✓ ${s.key}: ${s.value}`);
  }

  // ── 8. Notifications ──────────────────────────────────────────────
  console.log("\nCreating notifications...");

  const notificationsData = [
    {
      title: "New customer request received",
      message: `Ahmed Benali submitted a new request for iPhone 15 Pro Max.`,
      type: "request",
      read: false,
    },
    {
      title: "Low stock alert",
      message: `Moroccan Argan Oil Extra Virgin stock is running low. Current inventory: 8 units.`,
      type: "stock",
      read: false,
    },
    {
      title: "New message from customer",
      message: `Fatima Zahra left a note about the Traditional Moroccan Caftan sizing.`,
      type: "message",
      read: false,
    },
    {
      title: "Request completed",
      message: `Sara Idrissi request for Moroccan Ceramic Tagine was marked as Completed.`,
      type: "status",
      read: true,
    },
  ];

  for (const n of notificationsData) {
    await prisma.notification.create({ data: n });
    console.log(`  ✓ ${n.title}`);
  }

  console.log("\nDone seeding database!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
