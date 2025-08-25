import { z } from "zod";

export const createOrderSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  shippingAddress: z.string().min(1, "Shipping address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
  country: z.string().min(1, "Country is required"),

  subtotal: z.string().min(1, "Subtotal is required"),
  shipping: z.string().optional().default("0"),
  total: z.string().min(1, "Total is required"),

  notes: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const createOrderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  sellerId: z.string().min(1, "Seller ID is required"),
  quantity: z.number().int().positive("Quantity must be positive"),
  price: z.string().min(1, "Price is required"),
  variant: z.string().optional(),
});

export type CreateOrderItemInput = z.infer<typeof createOrderItemSchema>;

export const createFullOrderSchema = createOrderSchema.extend({
  items: z.array(createOrderItemSchema).min(1, "At least one item is required"),
});

export type CreateFullOrderInput = z.infer<typeof createFullOrderSchema>;
