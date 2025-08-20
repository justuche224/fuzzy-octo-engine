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
      price: validatedData.price.toString(),
      originalPrice: validatedData.originalPrice?.toString(),
      quantity: validatedData.quantity,
      unit: validatedData.unit,
      categoryId: validatedData.categoryId,
      sellerId: user.id,
      brand: validatedData.brand,
      weight: validatedData.weight,
      dimensions: validatedData.dimensions,
      badge: validatedData.badge,
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
      price: updateData.price?.toString(),
      originalPrice: updateData.originalPrice?.toString(),
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
        eq(orders.customerId, user.id),
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

  const sellerOrders = await db
    .select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      quantity: orderItems.quantity,
      price: orderItems.price,
      total: orderItems.total,
      variant: orderItems.variant,
      createdAt: orderItems.createdAt,
      product: {
        id: products.id,
        name: products.name,
        price: products.price,
      },
      order: {
        id: orders.id,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        shippingAddress: orders.shippingAddress,
        notes: orders.notes,
        createdAt: orders.createdAt,
      },
      customer: {
        id: sql<string>`"customer"."id"`,
        name: sql<string>`"customer"."name"`,
        email: sql<string>`"customer"."email"`,
      },
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .leftJoin(
      sql`"user" as "customer"`,
      eq(orders.customerId, sql`"customer"."id"`)
    )
    .where(eq(orderItems.sellerId, user.id))
    .orderBy(desc(orderItems.createdAt))
    .limit(limit)
    .offset(offset);

  return sellerOrders;
};
