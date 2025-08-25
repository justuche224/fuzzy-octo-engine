import db from "@/db";
import { orders } from "@/db/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  console.log("GET /api/order/confirmation");
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");
  const orderId = searchParams.get("orderId");

  if (!reference) {
    return new NextResponse("Missing reference", { status: 400 });
  }

  if (!orderId) {
    return new NextResponse("Missing orderId", { status: 400 });
  }

  const verifyUrl = `https://api.paystack.co/transaction/verify/${reference}`;
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  try {
    const response = await fetch(verifyUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.status && data.data?.status === "success") {
      const orderInfo = await db
        .select({ id: orders.id, status: orders.status })
        .from(orders)
        .where(eq(orders.id, orderId))
        .limit(1);

      if (!orderInfo[0]?.id) {
        return new NextResponse("Order not found", { status: 404 });
      }
      console.log("Payment verified");
      return NextResponse.redirect(
        new URL(
          `${process.env.NEXT_PUBLIC_AUTH_URL}/checkout/confirmed?orderId=${orderId}`,
          req.url
        )
      );
    } else {
      console.log("Payment verification failed");
      return new NextResponse("Payment verification failed", { status: 400 });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
