import React from "react";
import { serverAuth } from "@/lib/server-auth";
import { redirect } from "next/navigation";
import Purchases from "./purchases";
import db from "@/db";
import {
  orders as ordersTable,
  orderItems,
  type OrderWithItemCount,
} from "@/db/schema";
import { eq, sql } from "drizzle-orm";

const page = async () => {
  const user = await serverAuth();
  if (!user) {
    return redirect("/auth");
  }
  const orders = await db
    .select({
      id: ordersTable.id,
      userId: ordersTable.userId,
      status: ordersTable.status,
      paymentStatus: ordersTable.paymentStatus,
      subtotal: ordersTable.subtotal,
      shipping: ordersTable.shipping,
      total: ordersTable.total,
      shippingAddress: ordersTable.shippingAddress,
      city: ordersTable.city,
      state: ordersTable.state,
      zip: ordersTable.zip,
      country: ordersTable.country,
      phone: ordersTable.phone,
      email: ordersTable.email,
      name: ordersTable.name,
      paymentReference: ordersTable.paymentReference,
      paymentAccessCode: ordersTable.paymentAccessCode,
      notes: ordersTable.notes,
      createdAt: ordersTable.createdAt,
      updatedAt: ordersTable.updatedAt,
      itemCount: sql<number>`COUNT(${orderItems.id})`,
    })
    .from(ordersTable)
    .leftJoin(orderItems, eq(ordersTable.id, orderItems.orderId))
    .where(eq(ordersTable.userId, user.id))
    .groupBy(ordersTable.id);

  return <Purchases orders={orders as OrderWithItemCount[]} />;
};

export default page;
