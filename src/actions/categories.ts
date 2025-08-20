"use server";

import db from "@/db";
import { categories } from "@/db/schema";
import { asc } from "drizzle-orm";
import { serverAuth } from "@/lib/server-auth";
import { type CreateCategorySchema, createCategorySchema } from "@/types";

export const getCategories = async () => {
  return await db.select().from(categories).orderBy(asc(categories.name));
};

export const createCategory = async (data: CreateCategorySchema) => {
  const user = await serverAuth();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const validatedData = createCategorySchema.parse(data);
  const category = await db
    .insert(categories)
    .values({
      id: crypto.randomUUID(),
      name: validatedData.name,
      description: validatedData.description,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return category;
};
