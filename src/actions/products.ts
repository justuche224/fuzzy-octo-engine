"use server";

import db from "@/db";
import { z } from "zod";
import {
  categories,
  productVariants,
  reviews,
  userProfiles,
  orders,
  orderItems,
} from "@/db/schema";
import { productImages, products } from "@/db/schema";
import { eq, ilike, sql, desc, asc, inArray, and } from "drizzle-orm";
import {
  createProductSchema,
  updateProductSchema,
  type UpdateProductSchema,
  type CreateProductSchema,
} from "@/types";
import { serverAuth } from "@/lib/server-auth";

const getProductsSchema = z.object({
  page: z.number().default(1),
  limit: z.number().max(50).default(12),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  sellerId: z.string().optional(),
  sortBy: z
    .enum(["featured", "newest", "price-low", "price-high", "rating"])
    .default("featured"),
  inStock: z.boolean().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
});

const getProductReviewsSchema = z.object({
  productId: z.string(),
  page: z.number().default(1),
  limit: z.number().max(20).default(10),
});

const createReviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  content: z.string().min(5),
});

export const getProducts = async (data: z.infer<typeof getProductsSchema>) => {
  const validatedData = getProductsSchema.parse(data);
  const {
    page,
    limit,
    search,
    categoryId,
    sellerId,
    sortBy,
    inStock,
    minPrice,
    maxPrice,
  } = validatedData;
  const offset = (page - 1) * limit;

  let query = db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      originalPrice: products.originalPrice,
      quantity: products.quantity,
      unit: products.unit,
      inStock: products.inStock,
      rating: products.rating,
      reviewCount: products.reviewCount,
      badge: products.badge,
      categoryId: products.categoryId,
      sellerId: products.sellerId,
      createdAt: products.createdAt,
      category: {
        id: categories.id,
        name: categories.name,
      },
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .$dynamic();

  // Apply conditions
  if (search) {
    query = query.where(ilike(products.name, `%${search}%`));
  }
  if (categoryId) {
    query = query.where(eq(products.categoryId, categoryId));
  }
  if (sellerId) {
    query = query.where(eq(products.sellerId, sellerId));
  }
  if (inStock !== undefined) {
    query = query.where(eq(products.inStock, inStock));
  }
  if (minPrice !== undefined) {
    query = query.where(sql`${products.price} >= ${minPrice}`);
  }
  if (maxPrice !== undefined) {
    query = query.where(sql`${products.price} <= ${maxPrice}`);
  }

  // Apply sorting
  switch (sortBy) {
    case "newest":
      query = query.orderBy(desc(products.createdAt));
      break;
    case "price-low":
      query = query.orderBy(asc(products.price));
      break;
    case "price-high":
      query = query.orderBy(desc(products.price));
      break;
    case "rating":
      query = query.orderBy(desc(products.rating));
      break;
    default:
      query = query.orderBy(desc(products.createdAt));
  }

  const items = await query.limit(limit).offset(offset);

  const productIds = items.map((item) => item.id);

  const images = await db
    .select()
    .from(productImages)
    .where(inArray(productImages.productId, productIds));

  const itemsWithImages = items.map((item) => ({
    ...item,
    images: images.filter((img) => img.productId === item.id),
  }));

  return {
    items: itemsWithImages,
    pagination: {
      page: page,
      limit: limit,
      hasMore: items.length === limit,
    },
  };
};

export const getProduct = async (id: string) => {
  const [product] = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      originalPrice: products.originalPrice,
      quantity: products.quantity,
      unit: products.unit,
      inStock: products.inStock,
      rating: products.rating,
      reviewCount: products.reviewCount,
      brand: products.brand,
      sku: products.sku,
      weight: products.weight,
      dimensions: products.dimensions,
      badge: products.badge,
      categoryId: products.categoryId,
      sellerId: products.sellerId,
      createdAt: products.createdAt,
      category: {
        id: categories.id,
        name: categories.name,
      },
      seller: {
        id: sql<string>`"user"."id"`,
        name: sql<string>`"user"."name"`,
        email: sql<string>`"user"."email"`,
        image: sql<string>`"user"."image"`,
      },
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(sql`"user"`, eq(products.sellerId, sql`"user"."id"`))
    .where(eq(products.id, id));

  if (!product) {
    throw new Error("Product not found");
  }

  const [productImagesData, productVariantsData, farmerProfileData] =
    await Promise.all([
      db.select().from(productImages).where(eq(productImages.productId, id)),
      db
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, id)),
      db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, product.sellerId)),
    ]);

  return {
    ...product,
    images: productImagesData,
    variants: productVariantsData,
    farmerProfile: farmerProfileData[0] || null,
  };
};

export const createProduct = async (data: CreateProductSchema) => {
  const user = await serverAuth();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const validatedData = createProductSchema.parse(data);

  const productId = crypto.randomUUID();
  const now = new Date();

  const [product] = await db
    .insert(products)
    .values({
      id: productId,
      name: validatedData.name,
      description: validatedData.description,
      price: validatedData.price,
      originalPrice:
        validatedData.originalPrice === "" ? null : validatedData.originalPrice,
      quantity: validatedData.quantity,
      unit: validatedData.unit,
      categoryId: validatedData.categoryId,
      sellerId: user.id,
      brand: validatedData.brand || null,
      weight: validatedData.weight || null,
      dimensions: validatedData.dimensions || null,
      badge: validatedData.badge || null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  // Insert images
  if (validatedData.images.length > 0) {
    await db.insert(productImages).values(
      validatedData.images.map((url, index) => ({
        id: crypto.randomUUID(),
        productId,
        url,
        isPrimary: index === 0,
        createdAt: now,
      }))
    );
  }

  // Insert variants if provided
  if (validatedData.variants && validatedData.variants.length > 0) {
    await db.insert(productVariants).values(
      validatedData.variants.map((variant) => ({
        id: crypto.randomUUID(),
        productId,
        name: variant.name,
        value: variant.value,
        available: variant.available,
        createdAt: now,
      }))
    );
  }

  return product;
};

export const updateProduct = async (data: UpdateProductSchema) => {
  const user = await serverAuth();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const validatedData = updateProductSchema.parse(data);

  const { id, ...updateData } = validatedData;
  const now = new Date();

  // Verify product belongs to user
  const [existingProduct] = await db
    .select({ sellerId: products.sellerId })
    .from(products)
    .where(eq(products.id, id));

  if (!existingProduct || existingProduct.sellerId !== user.id) {
    throw new Error("Product not found or unauthorized");
  }

  const [updatedProduct] = await db
    .update(products)
    .set({
      ...updateData,
      price: updateData.price,
      originalPrice:
        updateData.originalPrice === "" ? null : updateData.originalPrice,
      brand: updateData.brand || null,
      weight: updateData.weight || null,
      dimensions: updateData.dimensions || null,
      badge: updateData.badge || null,
      updatedAt: now,
    })
    .where(eq(products.id, id))
    .returning();

  return updatedProduct;
};

export const deleteProduct = async (id: string) => {
  const user = await serverAuth();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const [existingProduct] = await db
    .select({ sellerId: products.sellerId })
    .from(products)
    .where(eq(products.id, id));

  if (!existingProduct || existingProduct.sellerId !== user.id) {
    throw new Error("Product not found or unauthorized");
  }

  await db.delete(products).where(eq(products.id, id));
  return { success: true };
};

export const getProductReviews = async (
  data: z.infer<typeof getProductReviewsSchema>
) => {
  const validatedData = getProductReviewsSchema.parse(data);
  const { productId, page, limit } = validatedData;
  const offset = (page - 1) * limit;

  const reviewsData = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      title: reviews.title,
      content: reviews.content,
      helpful: reviews.helpful,
      verified: reviews.verified,
      createdAt: reviews.createdAt,
      user: {
        id: sql<string>`"user"."id"`,
        name: sql<string>`"user"."name"`,
        image: sql<string>`"user"."image"`,
      },
    })
    .from(reviews)
    .leftJoin(sql`"user"`, eq(reviews.userId, sql`"user"."id"`))
    .where(eq(reviews.productId, productId))
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);

  return reviewsData;
};

export const createReview = async (
  data: z.infer<typeof createReviewSchema>
) => {
  const user = await serverAuth();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const validatedData = createReviewSchema.parse(data);

  const hasPurchased = await db
    .select({ id: orderItems.id })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(
      and(
        eq(orders.userId, user.id),
        eq(orderItems.productId, validatedData.productId)
      )
    )
    .limit(1);

  if (hasPurchased.length === 0) {
    throw new Error("You can only review products you have purchased");
  }

  const reviewId = crypto.randomUUID();
  const now = new Date();

  const [review] = await db
    .insert(reviews)
    .values({
      id: reviewId,
      productId: validatedData.productId,
      userId: user.id,
      rating: validatedData.rating,
      title: validatedData.title,
      content: validatedData.content,
      verified: true,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  // Update product rating
  const avgRating = await db
    .select({
      avg: sql<number>`AVG(${reviews.rating})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(reviews)
    .where(eq(reviews.productId, validatedData.productId));

  if (avgRating[0]) {
    await db
      .update(products)
      .set({
        rating: avgRating[0].avg.toString(),
        reviewCount: Number(avgRating[0].count),
      })
      .where(eq(products.id, validatedData.productId));
  }

  return review;
};

const getSellerOrdersSchema = z.object({
  page: z.number().default(1),
  limit: z.number().max(50).default(20),
});

export const getSellerOrders = async (
  data: z.infer<typeof getSellerOrdersSchema>
) => {
  const user = await serverAuth();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const validatedData = getSellerOrdersSchema.parse(data);
  const { page, limit } = validatedData;
  const offset = (page - 1) * limit;

  // First, get all order IDs that contain the seller's items, ordered by most recent order creation
  const orderIdsWithSellerItems = await db
    .select({
      orderId: orderItems.orderId,
      orderCreatedAt: orders.createdAt,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(eq(orderItems.sellerId, user.id))
    .groupBy(orderItems.orderId, orders.createdAt)
    .orderBy(desc(orders.createdAt))
    .limit(limit)
    .offset(offset);

  if (orderIdsWithSellerItems.length === 0) {
    return [];
  }

  const orderIds = orderIdsWithSellerItems.map((item) => item.orderId);

  // Get detailed order information with only the seller's items
  const sellerOrderDetails = await db
    .select({
      orderId: orders.id,
      orderStatus: orders.status,
      orderPaymentStatus: orders.paymentStatus,
      orderTotal: orders.total,
      orderSubtotal: orders.subtotal,
      orderShipping: orders.shipping,
      orderShippingAddress: orders.shippingAddress,
      orderCity: orders.city,
      orderState: orders.state,
      orderZip: orders.zip,
      orderCountry: orders.country,
      orderPhone: orders.phone,
      orderEmail: orders.email,
      orderName: orders.name,
      orderNotes: orders.notes,
      orderCreatedAt: orders.createdAt,
      orderUpdatedAt: orders.updatedAt,
      customer: {
        id: sql<string>`"customer"."id"`,
        name: sql<string>`"customer"."name"`,
        email: sql<string>`"customer"."email"`,
      },
      // Seller's items in this order
      itemId: orderItems.id,
      itemQuantity: orderItems.quantity,
      itemPrice: orderItems.price,
      itemTotal: orderItems.total,
      itemVariant: orderItems.variant,
      itemCreatedAt: orderItems.createdAt,
      product: {
        id: products.id,
        name: products.name,
        price: products.price,
        unit: products.unit,
        brand: products.brand,
      },
      productImage: productImages.url,
    })
    .from(orders)
    .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
    .innerJoin(products, eq(orderItems.productId, products.id))
    .leftJoin(
      productImages,
      and(
        eq(products.id, productImages.productId),
        eq(productImages.isPrimary, true)
      )
    )
    .leftJoin(
      sql`"user" as "customer"`,
      eq(orders.userId, sql`"customer"."id"`)
    )
    .where(and(inArray(orders.id, orderIds), eq(orderItems.sellerId, user.id)))
    .orderBy(desc(orders.createdAt));

  // Group by order ID
  const groupedOrders = sellerOrderDetails.reduce(
    (acc, row) => {
      const orderId = row.orderId;

      if (!acc[orderId]) {
        acc[orderId] = {
          orderId: row.orderId,
          status: row.orderStatus,
          paymentStatus: row.orderPaymentStatus,
          total: row.orderTotal,
          subtotal: row.orderSubtotal,
          shipping: row.orderShipping || "0",
          shippingAddress: row.orderShippingAddress,
          city: row.orderCity,
          state: row.orderState,
          zip: row.orderZip,
          country: row.orderCountry,
          phone: row.orderPhone,
          email: row.orderEmail,
          name: row.orderName,
          notes: row.orderNotes,
          createdAt: row.orderCreatedAt,
          updatedAt: row.orderUpdatedAt,
          customer: row.customer,
          items: [],
          sellerTotal: 0,
          sellerItemCount: 0,
        };
      }

      if (row.itemId) {
        acc[orderId].items.push({
          id: row.itemId,
          quantity: row.itemQuantity,
          price: row.itemPrice,
          total: row.itemTotal,
          variant: row.itemVariant,
          createdAt: row.itemCreatedAt,
          product: row.product,
          productImage: row.productImage,
        });
        acc[orderId].sellerTotal += Number(row.itemTotal);
        acc[orderId].sellerItemCount += row.itemQuantity;
      }

      return acc;
    },
    {} as Record<
      string,
      {
        orderId: string;
        status: string;
        paymentStatus: string | null;
        total: string;
        subtotal: string;
        shipping: string;
        shippingAddress: string | null;
        city: string | null;
        state: string | null;
        zip: string | null;
        country: string | null;
        phone: string | null;
        email: string | null;
        name: string | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        customer: {
          id: string;
          name: string;
          email: string;
        } | null;
        items: Array<{
          id: string;
          quantity: number;
          price: string;
          total: string;
          variant: string | null;
          createdAt: Date;
          product: {
            id: string;
            name: string;
            price: string;
            unit: string;
            brand: string | null;
          };
          productImage: string | null;
        }>;
        sellerTotal: number;
        sellerItemCount: number;
      }
    >
  );

  return Object.values(groupedOrders);
};

const getSellerOrderDetailsSchema = z.object({
  orderId: z.string(),
});

export const getSellerOrderDetails = async (
  data: z.infer<typeof getSellerOrderDetailsSchema>
) => {
  const user = await serverAuth();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const { orderId } = getSellerOrderDetailsSchema.parse(data);

  // First check if this seller has any items in this order
  const sellerHasItemsInOrder = await db
    .select({ itemId: orderItems.id })
    .from(orderItems)
    .where(
      and(eq(orderItems.orderId, orderId), eq(orderItems.sellerId, user.id))
    )
    .limit(1);

  if (sellerHasItemsInOrder.length === 0) {
    throw new Error("Order not found or you don't have items in this order");
  }

  // Get full order details with only seller's items
  const orderDetails = await db
    .select({
      orderId: orders.id,
      orderStatus: orders.status,
      orderPaymentStatus: orders.paymentStatus,
      orderTotal: orders.total,
      orderSubtotal: orders.subtotal,
      orderShipping: orders.shipping,
      orderShippingAddress: orders.shippingAddress,
      orderCity: orders.city,
      orderState: orders.state,
      orderZip: orders.zip,
      orderCountry: orders.country,
      orderPhone: orders.phone,
      orderEmail: orders.email,
      orderName: orders.name,
      orderNotes: orders.notes,
      orderCreatedAt: orders.createdAt,
      orderUpdatedAt: orders.updatedAt,
      customer: {
        id: sql<string>`"customer"."id"`,
        name: sql<string>`"customer"."name"`,
        email: sql<string>`"customer"."email"`,
      },
      // Seller's items in this order
      itemId: orderItems.id,
      itemQuantity: orderItems.quantity,
      itemPrice: orderItems.price,
      itemTotal: orderItems.total,
      itemVariant: orderItems.variant,
      itemCreatedAt: orderItems.createdAt,
      product: {
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        unit: products.unit,
        brand: products.brand,
      },
      productImage: productImages.url,
    })
    .from(orders)
    .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
    .innerJoin(products, eq(orderItems.productId, products.id))
    .leftJoin(
      productImages,
      and(
        eq(products.id, productImages.productId),
        eq(productImages.isPrimary, true)
      )
    )
    .leftJoin(
      sql`"user" as "customer"`,
      eq(orders.userId, sql`"customer"."id"`)
    )
    .where(and(eq(orders.id, orderId), eq(orderItems.sellerId, user.id)))
    .orderBy(orderItems.createdAt);

  if (orderDetails.length === 0) {
    throw new Error("Order not found");
  }

  const firstRow = orderDetails[0];
  const items = orderDetails.map((row) => ({
    id: row.itemId,
    quantity: row.itemQuantity,
    price: row.itemPrice,
    total: row.itemTotal,
    variant: row.itemVariant,
    createdAt: row.itemCreatedAt,
    product: row.product,
    productImage: row.productImage,
  }));

  const sellerTotal = items.reduce((sum, item) => sum + Number(item.total), 0);
  const sellerItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    orderId: firstRow.orderId,
    status: firstRow.orderStatus,
    paymentStatus: firstRow.orderPaymentStatus,
    total: firstRow.orderTotal,
    subtotal: firstRow.orderSubtotal,
    shipping: firstRow.orderShipping,
    shippingAddress: firstRow.orderShippingAddress,
    city: firstRow.orderCity,
    state: firstRow.orderState,
    zip: firstRow.orderZip,
    country: firstRow.orderCountry,
    phone: firstRow.orderPhone,
    email: firstRow.orderEmail,
    name: firstRow.orderName,
    notes: firstRow.orderNotes,
    createdAt: firstRow.orderCreatedAt,
    updatedAt: firstRow.orderUpdatedAt,
    customer: firstRow.customer,
    items,
    sellerTotal,
    sellerItemCount,
    isPartialOrder: true, // This indicates it's a multi-vendor order showing only seller's items
  };
};
