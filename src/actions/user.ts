"use server";

import db from "@/db";
import { user, userProfiles } from "@/db/schema";
import { userProfileSchema } from "@/types";
import { serverAuth } from "@/lib/server-auth";
import { eq } from "drizzle-orm";
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
