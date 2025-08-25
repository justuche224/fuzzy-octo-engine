import { serverAuth } from "@/lib/server-auth";
import { NextResponse } from "next/server";
import { createFullOrderSchema } from "@/schemas";
import db from "@/db";
import { products, orders, orderItems } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const user = await serverAuth();
    if (!user) {
      console.error("Unauthorized");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    const validatedData = createFullOrderSchema.safeParse(body);
    if (!validatedData.success) {
      console.error("Invalid data");
      console.error(validatedData.error);
      return new NextResponse(
        JSON.stringify({ error: validatedData.error.message }),
        { status: 400 }
      );
    }

    const fullOrder = validatedData.data;

    const orderId = crypto.randomUUID();

    const paystackParams = {
      email: user.email,
      amount: Number(fullOrder.total) * 100,
      callback_url: `${process.env.NEXT_PUBLIC_AUTH_URL}/api/order/confirmation?orderId=${orderId}`,
      metadata: {
        customerId: user.id,
        orderId,
      },
    };

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paystackParams),
      }
    );

    const responseData = await paystackResponse.json();

    if (!responseData.status || !responseData.data?.authorization_url) {
      return new NextResponse("Failed to initialize payment", { status: 400 });
    }

    // Handle multiple sellers by creating product-seller validation pairs
    const productSellerPairs = fullOrder.items.map((item) => ({
      productId: item.productId,
      sellerId: item.sellerId,
    }));

    // Create a complex where clause to validate all product-seller combinations
    const whereConditions = productSellerPairs.map((pair) =>
      and(eq(products.id, pair.productId), eq(products.sellerId, pair.sellerId))
    );

    // Query all products that match the product-seller pairs
    const dbProducts = await db
      .select({
        id: products.id,
        name: products.name,
        sku: products.sku,
        sellerId: products.sellerId,
      })
      .from(products)
      .where(or(...whereConditions));

    // Validate that all requested products were found
    const foundProductIds = new Set(dbProducts.map((p) => p.id));
    const requestedProductIds = new Set(
      fullOrder.items.map((item) => item.productId)
    );

    const missingProducts = [...requestedProductIds].filter(
      (id) => !foundProductIds.has(id)
    );
    if (missingProducts.length > 0) {
      return new NextResponse(
        JSON.stringify({
          error: `Products not found: ${missingProducts.join(", ")}`,
        }),
        { status: 400 }
      );
    }

    // Create the order and order items directly
    const [createdOrder] = await db
      .insert(orders)
      .values({
        id: orderId,
        userId: user.id,
        status: "pending",
        paymentStatus: "pending",
        subtotal: fullOrder.subtotal,
        shipping: fullOrder.shipping,
        total: fullOrder.total,
        shippingAddress: fullOrder.shippingAddress,
        city: fullOrder.city,
        state: fullOrder.state,
        zip: fullOrder.zip,
        country: fullOrder.country,
        phone: fullOrder.phone,
        email: fullOrder.email,
        name: fullOrder.name,
        paymentReference: responseData.data.reference,
        paymentAccessCode: responseData.data.access_code,
        notes: fullOrder.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    const orderItemsData = fullOrder.items.map((item) => ({
      id: crypto.randomUUID(),
      orderId: orderId,
      productId: item.productId,
      sellerId: item.sellerId,
      quantity: item.quantity,
      price: item.price,
      total: (Number(item.price) * item.quantity).toString(),
      variant: item.variant,
      createdAt: new Date(),
    }));

    await db.insert(orderItems).values(orderItemsData);

    // Return success response with payment URL and order details
    return new NextResponse(
      JSON.stringify({
        success: true,
        order: {
          id: createdOrder.id,
          status: createdOrder.status,
          total: createdOrder.total,
        },
        payment: {
          authorization_url: responseData.data.authorization_url,
          reference: responseData.data.reference,
        },
        message: "Order created successfully. Proceed to payment.",
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500 }
    );
  }
}
