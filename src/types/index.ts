import { z } from "zod";

export const createProductSchema = z.object({
    name: z.string().min(2),
    description: z.string().min(10),
    price: z.string().transform((val) => parseFloat(val)),
    originalPrice: z
      .string()
      .optional()
      .transform((val) => (val ? parseFloat(val) : undefined)),
    quantity: z.number().int().min(0),
    unit: z.string().min(1),
    categoryId: z.string(),
    brand: z.string().optional(),
    weight: z.string().optional(),
    dimensions: z.string().optional(),
    badge: z.string().optional(),
    images: z.array(z.string()),
    variants: z
      .array(
        z.object({
          name: z.string(),
          value: z.string(),
          available: z.boolean().default(true),
        })
      )
      .optional(),
  });

  export const updateProductSchema = createProductSchema.partial().extend({
    id: z.string(),
  });

  export const createCategorySchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
  });
  
  export const createReviewSchema = z.object({
    productId: z.string(),
    rating: z.number().int().min(1).max(5),
    title: z.string().optional(),
    content: z.string().min(5),
  });
  
  export const cartItemSchema = z.object({
    productId: z.string(),
    quantity: z.number().int().min(1),
    variant: z.string().optional(),
  });
  
  export const createOrderSchema = z.object({
    items: z.array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1),
        variant: z.string().optional(),
      })
    ),
    shippingAddress: z.string(),
    billingAddress: z.string().optional(),
    paymentMethod: z.string(),
    notes: z.string().optional(),
  });

  export const userProfileSchema = z.object({
    farmName: z.string().optional(),
    description: z.string().optional(),
    location: z.string().optional(),
    phone: z.string().optional(),
    website: z.string().optional(),
    certifications: z.string().optional(),
    avatar: z.string().optional(),
    banner: z.string().optional(),
  });

export type CreateProductSchema = z.infer<typeof createProductSchema>;
export type UpdateProductSchema = z.infer<typeof updateProductSchema>;
export type CreateReviewSchema = z.infer<typeof createReviewSchema>;
export type CartItemSchema = z.infer<typeof cartItemSchema>;
export type CreateOrderSchema = z.infer<typeof createOrderSchema>;
export type CreateCategorySchema = z.infer<typeof createCategorySchema>;