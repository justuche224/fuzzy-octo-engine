"use server";

import db from "@/db";
import {
  savedProducts,
  user,
  userProfiles,
  products,
  productImages,
  orders,
  orderItems,
} from "@/db/schema";
import { userProfileSchema } from "@/types";
import { serverAuth } from "@/lib/server-auth";
import { and, eq, desc, sql } from "drizzle-orm";
import { z } from "zod";

export const getUserProfile = async () => {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, currentUser.id));

  return {
    user: currentUser,
    profile: profile || null,
  };
};

export const updateUserProfile = async (
  data: z.infer<typeof userProfileSchema>
) => {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const validatedData = userProfileSchema.parse(data);
  const now = new Date();

  const [existingProfile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, currentUser.id));

  if (existingProfile) {
    const [updatedProfile] = await db
      .update(userProfiles)
      .set({
        ...validatedData,
        updatedAt: now,
      })
      .where(eq(userProfiles.userId, currentUser.id))
      .returning();

    return updatedProfile;
  } else {
    const [newProfile] = await db
      .insert(userProfiles)
      .values({
        id: crypto.randomUUID(),
        userId: currentUser.id,
        ...validatedData,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return newProfile;
  }
};

export const getSellerProfile = async (sellerId: string) => {
  const [sellerData] = await db
    .select({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        createdAt: user.createdAt,
      },
      profile: {
        farmName: userProfiles.farmName,
        description: userProfiles.description,
        location: userProfiles.location,
        phone: userProfiles.phone,
        website: userProfiles.website,
        certifications: userProfiles.certifications,
        avatar: userProfiles.avatar,
        banner: userProfiles.banner,
        verified: userProfiles.verified,
      },
    })
    .from(user)
    .leftJoin(userProfiles, eq(user.id, userProfiles.userId))
    .where(eq(user.id, sellerId));

  if (!sellerData) {
    throw new Error("Seller not found");
  }

  return sellerData;
};

export const getSellerProfileWithProducts = async (
  sellerId: string,
  page: number = 1,
  limit: number = 12
) => {
  const { getProducts } = await import("./products");

  const [sellerProfile, sellerProducts] = await Promise.all([
    getSellerProfile(sellerId),
    getProducts({
      page,
      limit,
      sellerId,
      sortBy: "newest" as const,
    }),
  ]);

  return {
    seller: sellerProfile,
    products: sellerProducts,
  };
};

export const saveProduct = async (productId: string) => {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  try {
    const existingSavedProduct = await db
      .select()
      .from(savedProducts)
      .where(
        and(
          eq(savedProducts.userId, currentUser.id),
          eq(savedProducts.productId, productId)
        )
      );
    if (existingSavedProduct.length > 0) {
      throw new Error("Product already saved");
    }

    await db.insert(savedProducts).values({
      id: crypto.randomUUID(),
      userId: currentUser.id,
      productId,
      createdAt: new Date(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to save product");
  }
};

export const unsaveProduct = async (productId: string) => {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  try {
    await db
      .delete(savedProducts)
      .where(
        and(
          eq(savedProducts.userId, currentUser.id),
          eq(savedProducts.productId, productId)
        )
      );
    return {
      success: true,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to unsave product");
  }
};

export const isProductSaved = async (productId: string) => {
  try {
    const currentUser = await serverAuth();
    if (!currentUser) {
      return false;
    }

    const savedProduct = await db
      .select()
      .from(savedProducts)
      .where(
        and(
          eq(savedProducts.userId, currentUser.id),
          eq(savedProducts.productId, productId)
        )
      );
    return savedProduct.length > 0;
  } catch (error) {
    console.error(error);
    return false;
  }
};

// Get saved product IDs for a customer (useful for bulk checking in product lists)
export const getSavedProductIds = async () => {
  const currentUser = await serverAuth();
  if (!currentUser) {
    return [];
  }

  const savedProductIds = await db
    .select({ productId: savedProducts.productId })
    .from(savedProducts)
    .where(eq(savedProducts.userId, currentUser.id));
  return savedProductIds.map((sp) => sp.productId);
};

export const getSavedProducts = async (
  page: number = 1,
  limit: number = 12
) => {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const offset = (page - 1) * limit;

  const savedProductsWithDetails = await db
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
      badge: products.badge,
      categoryId: products.categoryId,
      sellerId: products.sellerId,
      images: productImages.url,
      savedAt: savedProducts.createdAt,
    })
    .from(savedProducts)
    .innerJoin(products, eq(savedProducts.productId, products.id))
    .leftJoin(
      productImages,
      and(
        eq(products.id, productImages.productId),
        eq(productImages.isPrimary, true)
      )
    )
    .where(eq(savedProducts.userId, currentUser.id))
    .orderBy(desc(savedProducts.createdAt))
    .limit(limit)
    .offset(offset);

  const totalCount = await db
    .select({ count: savedProducts.id })
    .from(savedProducts)
    .where(eq(savedProducts.userId, currentUser.id));

  return {
    items: savedProductsWithDetails,
    totalCount: totalCount.length,
    totalPages: Math.ceil(totalCount.length / limit),
    currentPage: page,
  };
};

export const getUserOrderDetails = async (orderId: string) => {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const orderWithItems = await db
    .select({
      order: orders,
      items: {
        id: orderItems.id,
        quantity: orderItems.quantity,
        price: orderItems.price,
        total: orderItems.total,
        variant: orderItems.variant,
        productName: products.name,
        productImage: productImages.url,
        productBrand: products.brand,
        productUnit: products.unit,
      },
    })
    .from(orders)
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .leftJoin(products, eq(orderItems.productId, products.id))
    .leftJoin(
      productImages,
      and(
        eq(products.id, productImages.productId),
        eq(productImages.isPrimary, true)
      )
    )
    .where(and(eq(orders.id, orderId), eq(orders.userId, currentUser.id)));

  if (!orderWithItems.length) {
    throw new Error("Order not found");
  }

  const order = orderWithItems[0].order;
  const items = orderWithItems
    .filter((item) => item.items.id && item.items.productName)
    .map((item) => item.items);

  return {
    ...order,
    items,
  };
};

export const getDashboardStats = async () => {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  try {
    // Get user's products count
    const [productStats] = await db
      .select({
        totalProducts: sql<number>`COUNT(*)`,
        activeProducts: sql<number>`COUNT(*) FILTER (WHERE ${products.inStock} = true)`,
        outOfStockProducts: sql<number>`COUNT(*) FILTER (WHERE ${products.inStock} = false)`,
      })
      .from(products)
      .where(eq(products.sellerId, currentUser.id));

    return {
      totalProducts: Number(productStats?.totalProducts || 0),
      activeProducts: Number(productStats?.activeProducts || 0),
      outOfStockProducts: Number(productStats?.outOfStockProducts || 0),
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard statistics");
  }
};

export const getDashboardPurchases = async () => {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  try {
    // Get user's purchase statistics
    const [purchaseStats] = await db
      .select({
        totalOrders: sql<number>`COUNT(DISTINCT ${orders.id})`,
        totalSpent: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
        pendingOrders: sql<number>`COUNT(DISTINCT ${orders.id}) FILTER (WHERE ${orders.status} = 'pending')`,
        completedOrders: sql<number>`COUNT(DISTINCT ${orders.id}) FILTER (WHERE ${orders.status} = 'completed')`,
      })
      .from(orders)
      .where(eq(orders.userId, currentUser.id));

    return {
      totalOrders: Number(purchaseStats?.totalOrders || 0),
      totalSpent: Number(purchaseStats?.totalSpent || 0),
      pendingOrders: Number(purchaseStats?.pendingOrders || 0),
      completedOrders: Number(purchaseStats?.completedOrders || 0),
    };
  } catch (error) {
    console.error("Error fetching purchase stats:", error);
    throw new Error("Failed to fetch purchase statistics");
  }
};

export const getDashboardSavedProducts = async () => {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  try {
    const [savedStats] = await db
      .select({
        totalSaved: sql<number>`COUNT(*)`,
      })
      .from(savedProducts)
      .where(eq(savedProducts.userId, currentUser.id));

    return {
      totalSaved: Number(savedStats?.totalSaved || 0),
    };
  } catch (error) {
    console.error("Error fetching saved products stats:", error);
    throw new Error("Failed to fetch saved products statistics");
  }
};
