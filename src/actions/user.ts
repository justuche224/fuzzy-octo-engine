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
  categories,
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

// Admin Functions
const isAdmin = async () => {
  const currentUser = await serverAuth();
  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  return currentUser;
};

export const getAdminStats = async () => {
  await isAdmin();

  try {
    // Platform overview statistics
    const [platformStats] = await db
      .select({
        totalUsers: sql<number>`COUNT(DISTINCT ${user.id})`,
        totalSellers: sql<number>`COUNT(DISTINCT ${user.id}) FILTER (WHERE ${user.role} = 'SELLER' OR ${user.id} IN (SELECT DISTINCT ${products.sellerId} FROM ${products}))`,
        totalAdmins: sql<number>`COUNT(DISTINCT ${user.id}) FILTER (WHERE ${user.role} = 'ADMIN')`,
        totalProducts: sql<number>`(SELECT COUNT(*) FROM ${products})`,
        totalOrders: sql<number>`(SELECT COUNT(*) FROM ${orders})`,
        totalRevenue: sql<number>`(SELECT COALESCE(SUM(${orders.total}), 0) FROM ${orders} WHERE ${orders.paymentStatus} = 'paid')`,
        totalCategories: sql<number>`(SELECT COUNT(*) FROM ${categories})`,
        recentUsers: sql<number>`COUNT(DISTINCT ${user.id}) FILTER (WHERE ${user.createdAt} >= NOW() - INTERVAL '30 days')`,
      })
      .from(user);

    return {
      totalUsers: Number(platformStats?.totalUsers || 0),
      totalSellers: Number(platformStats?.totalSellers || 0),
      totalAdmins: Number(platformStats?.totalAdmins || 0),
      totalProducts: Number(platformStats?.totalProducts || 0),
      totalOrders: Number(platformStats?.totalOrders || 0),
      totalRevenue: Number(platformStats?.totalRevenue || 0),
      totalCategories: Number(platformStats?.totalCategories || 0),
      recentUsers: Number(platformStats?.recentUsers || 0),
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw new Error("Failed to fetch admin statistics");
  }
};

const getAllUsersSchema = z.object({
  page: z.number().default(1),
  limit: z.number().max(50).default(20),
  search: z.string().optional(),
  role: z.enum(["USER", "SELLER", "ADMIN"]).optional(),
});

export const getAllUsers = async (data: z.infer<typeof getAllUsersSchema>) => {
  await isAdmin();

  const validatedData = getAllUsersSchema.parse(data);
  const { page, limit, search, role } = validatedData;
  const offset = (page - 1) * limit;

  try {
    let query = db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.emailVerified,
        image: user.image,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        productCount: sql<number>`(SELECT COUNT(*) FROM ${products} WHERE ${products.sellerId} = ${user.id})`,
        orderCount: sql<number>`(SELECT COUNT(*) FROM ${orders} WHERE ${orders.userId} = ${user.id})`,
      })
      .from(user)
      .$dynamic();

    if (search) {
      query = query.where(
        sql`${user.name} ILIKE ${`%${search}%`} OR ${
          user.email
        } ILIKE ${`%${search}%`}`
      );
    }

    if (role) {
      query = query.where(eq(user.role, role));
    }

    const users = await query
      .orderBy(desc(user.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    let countQuery = db
      .select({ count: sql<number>`COUNT(*)` })
      .from(user)
      .$dynamic();

    if (search) {
      countQuery = countQuery.where(
        sql`${user.name} ILIKE ${`%${search}%`} OR ${
          user.email
        } ILIKE ${`%${search}%`}`
      );
    }

    if (role) {
      countQuery = countQuery.where(eq(user.role, role));
    }

    const [{ count }] = await countQuery;

    return {
      users,
      totalCount: Number(count),
      totalPages: Math.ceil(Number(count) / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error("Failed to fetch users");
  }
};

const updateUserRoleSchema = z.object({
  userId: z.string(),
  role: z.enum(["USER", "SELLER", "ADMIN"]),
});

export const updateUserRole = async (
  data: z.infer<typeof updateUserRoleSchema>
) => {
  await isAdmin();

  const { userId, role } = updateUserRoleSchema.parse(data);

  try {
    const [updatedUser] = await db
      .update(user)
      .set({
        role,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning();

    return updatedUser;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw new Error("Failed to update user role");
  }
};

const toggleUserStatusSchema = z.object({
  userId: z.string(),
  emailVerified: z.boolean(),
});

export const toggleUserStatus = async (
  data: z.infer<typeof toggleUserStatusSchema>
) => {
  await isAdmin();

  const { userId, emailVerified } = toggleUserStatusSchema.parse(data);

  try {
    const [updatedUser] = await db
      .update(user)
      .set({
        emailVerified,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning();

    return updatedUser;
  } catch (error) {
    console.error("Error toggling user status:", error);
    throw new Error("Failed to update user status");
  }
};

const deleteUserSchema = z.object({
  userId: z.string(),
});

export const deleteUser = async (data: z.infer<typeof deleteUserSchema>) => {
  await isAdmin();

  const { userId } = deleteUserSchema.parse(data);

  try {
    await db.delete(user).where(eq(user.id, userId));
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
};

export const canUserReview = async (productId: string) => {
  const currentUser = await serverAuth();
  if (!currentUser) {
    return { canReview: false, reason: "Must be logged in" };
  }

  try {
    const hasPurchased = await db
      .select({ id: orderItems.id })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orders.userId, currentUser.id),
          eq(orderItems.productId, productId),
          eq(orders.paymentStatus, "paid")
        )
      )
      .limit(1);

    if (hasPurchased.length === 0) {
      return { canReview: false, reason: "Must purchase product to review" };
    }

    const { reviews } = await import("@/db/schema");
    const existingReview = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(
        and(
          eq(reviews.userId, currentUser.id),
          eq(reviews.productId, productId)
        )
      )
      .limit(1);

    if (existingReview.length > 0) {
      return {
        canReview: false,
        reason: "Already reviewed this product",
        hasReview: true,
      };
    }

    return { canReview: true };
  } catch (error) {
    console.error("Error checking review eligibility:", error);
    return { canReview: false, reason: "Error checking eligibility" };
  }
};

export const getUserReviewForProduct = async (productId: string) => {
  const currentUser = await serverAuth();
  if (!currentUser) {
    return null;
  }

  try {
    const { reviews } = await import("@/db/schema");
    const [userReview] = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        title: reviews.title,
        content: reviews.content,
        helpful: reviews.helpful,
        verified: reviews.verified,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
      })
      .from(reviews)
      .where(
        and(
          eq(reviews.userId, currentUser.id),
          eq(reviews.productId, productId)
        )
      );

    return userReview || null;
  } catch (error) {
    console.error("Error fetching user review:", error);
    return null;
  }
};

const updateReviewSchema = z.object({
  reviewId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  content: z.string().min(5),
});

export const updateReview = async (
  data: z.infer<typeof updateReviewSchema>
) => {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const validatedData = updateReviewSchema.parse(data);
  const { reviews } = await import("@/db/schema");

  try {
    const [existingReview] = await db
      .select({ userId: reviews.userId, productId: reviews.productId })
      .from(reviews)
      .where(eq(reviews.id, validatedData.reviewId));

    if (!existingReview || existingReview.userId !== currentUser.id) {
      throw new Error("Review not found or unauthorized");
    }

    const [updatedReview] = await db
      .update(reviews)
      .set({
        rating: validatedData.rating,
        title: validatedData.title,
        content: validatedData.content,
        updatedAt: new Date(),
      })
      .where(eq(reviews.id, validatedData.reviewId))
      .returning();

    const avgRating = await db
      .select({
        avg: sql<number>`AVG(${reviews.rating})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(reviews)
      .where(eq(reviews.productId, existingReview.productId));

    if (avgRating[0]) {
      await db
        .update(products)
        .set({
          rating: avgRating[0].avg.toString(),
          reviewCount: Number(avgRating[0].count),
        })
        .where(eq(products.id, existingReview.productId));
    }

    return updatedReview;
  } catch (error) {
    console.error("Error updating review:", error);
    throw new Error("Failed to update review");
  }
};

const deleteReviewSchema = z.object({
  reviewId: z.string(),
});

export const deleteReview = async (
  data: z.infer<typeof deleteReviewSchema>
) => {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const { reviewId } = deleteReviewSchema.parse(data);
  const { reviews } = await import("@/db/schema");

  try {
    const [existingReview] = await db
      .select({ userId: reviews.userId, productId: reviews.productId })
      .from(reviews)
      .where(eq(reviews.id, reviewId));

    if (!existingReview || existingReview.userId !== currentUser.id) {
      throw new Error("Review not found or unauthorized");
    }

    await db.delete(reviews).where(eq(reviews.id, reviewId));

    const avgRating = await db
      .select({
        avg: sql<number>`AVG(${reviews.rating})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(reviews)
      .where(eq(reviews.productId, existingReview.productId));

    await db
      .update(products)
      .set({
        rating: avgRating[0]?.avg?.toString() || "0",
        reviewCount: Number(avgRating[0]?.count || 0),
      })
      .where(eq(products.id, existingReview.productId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting review:", error);
    throw new Error("Failed to delete review");
  }
};

const markReviewHelpfulSchema = z.object({
  reviewId: z.string(),
});

export const markReviewHelpful = async (
  data: z.infer<typeof markReviewHelpfulSchema>
) => {
  const currentUser = await serverAuth();
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  const { reviewId } = markReviewHelpfulSchema.parse(data);
  const { reviews } = await import("@/db/schema");

  try {
    const [updatedReview] = await db
      .update(reviews)
      .set({
        helpful: sql`${reviews.helpful} + 1`,
      })
      .where(eq(reviews.id, reviewId))
      .returning();

    return updatedReview;
  } catch (error) {
    console.error("Error marking review as helpful:", error);
    throw new Error("Failed to mark review as helpful");
  }
};
