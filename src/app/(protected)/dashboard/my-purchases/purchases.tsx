"use client";

import { type OrderWithItemCount } from "@/db/schema";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import formatPrice from "@/lib/format-price";
import { useIsMobile } from "@/hooks/use-mobile";
import { getUserOrderDetails } from "@/actions/user";
import { Eye } from "lucide-react";
import Image from "next/image";

type OrderItem = {
  id: string | null;
  quantity: number | null;
  price: string | null;
  total: string | null;
  variant: string | null;
  productName: string | null;
  productImage: string | null;
  productBrand: string | null;
  productUnit: string | null;
};

type OrderDetails = {
  id: string;
  userId: string;
  status: string;
  paymentStatus: string | null;
  subtotal: string;
  shipping: string | null;
  total: string;
  shippingAddress: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  name: string | null;
  paymentReference: string;
  paymentAccessCode: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
};

const Purchases = ({ orders }: { orders: OrderWithItemCount[] }) => {
  const isMobile = useIsMobile();
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      pending: "outline",
      processing: "secondary",
      shipped: "default",
      delivered: "default",
      cancelled: "destructive",
    };
    return variants[status] || "outline";
  };

  const getPaymentStatusBadge = (status: string | null) => {
    const variants: Record<
      string,
      "default" | "secondary" | "destructive" | "outline"
    > = {
      pending: "outline",
      processing: "secondary",
      completed: "default",
      failed: "destructive",
    };
    return variants[status || "pending"] || "outline";
  };

  const handleViewDetails = async (orderId: string) => {
    setLoading(true);
    try {
      const orderDetails = await getUserOrderDetails(orderId);
      setSelectedOrder(orderDetails);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Failed to load order details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isMobile) {
    return (
      <div className="space-y-4 mt-5 px-2">
        <h2 className="text-2xl font-bold">My Purchases</h2>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No purchases found.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    Order #{order.id.slice(-8)}
                  </CardTitle>
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                      <Badge variant={getStatusBadge(order.status)}>
                        {order.status}
                      </Badge>
                      <Badge
                        variant={getPaymentStatusBadge(order.paymentStatus)}
                      >
                        {order.paymentStatus || "pending"}
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(order.id)}
                      disabled={loading}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Items:
                    </span>
                    <span className="font-medium">{order.itemCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total:
                    </span>
                    <span className="font-medium">
                      {formatPrice(parseFloat(order.total))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Date:</span>
                    <span className="font-medium">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {order.shippingAddress && (
                    <div className="pt-2 border-t">
                      <span className="text-sm text-muted-foreground">
                        Shipping to:
                      </span>
                      <p className="text-sm mt-1">{order.shippingAddress}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 container mx-auto max-w-7xl mt-5">
      <h2 className="text-2xl font-bold">My Purchases</h2>
      {orders.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No purchases found.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  #{order.id.slice(-8)}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadge(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getPaymentStatusBadge(order.paymentStatus)}>
                    {order.paymentStatus || "pending"}
                  </Badge>
                </TableCell>
                <TableCell>{order.itemCount}</TableCell>
                <TableCell className="font-medium">
                  {formatPrice(parseFloat(order.total))}
                </TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(order.id)}
                    disabled={loading}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Header */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Order Information</h3>
                  <div className="space-y-1">
                    <p>
                      <span className="text-sm text-muted-foreground">
                        Order ID:
                      </span>{" "}
                      #{selectedOrder.id.slice(-8)}
                    </p>
                    <p>
                      <span className="text-sm text-muted-foreground">
                        Date:
                      </span>{" "}
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                    <p>
                      <span className="text-sm text-muted-foreground">
                        Last Updated:
                      </span>{" "}
                      {new Date(selectedOrder.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Status</h3>
                  <div className="flex gap-2">
                    <Badge variant={getStatusBadge(selectedOrder.status)}>
                      {selectedOrder.status}
                    </Badge>
                    <Badge
                      variant={getPaymentStatusBadge(
                        selectedOrder.paymentStatus
                      )}
                    >
                      {selectedOrder.paymentStatus || "pending"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              {(selectedOrder.shippingAddress ||
                selectedOrder.name ||
                selectedOrder.email) && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Shipping Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                    {selectedOrder.name && (
                      <p>
                        <span className="text-sm text-muted-foreground">
                          Name:
                        </span>{" "}
                        {selectedOrder.name}
                      </p>
                    )}
                    {selectedOrder.email && (
                      <p>
                        <span className="text-sm text-muted-foreground">
                          Email:
                        </span>{" "}
                        {selectedOrder.email}
                      </p>
                    )}
                    {selectedOrder.phone && (
                      <p>
                        <span className="text-sm text-muted-foreground">
                          Phone:
                        </span>{" "}
                        {selectedOrder.phone}
                      </p>
                    )}
                    {selectedOrder.shippingAddress && (
                      <div className="md:col-span-2">
                        <span className="text-sm text-muted-foreground">
                          Address:
                        </span>
                        <p className="mt-1">
                          {selectedOrder.shippingAddress}
                          {selectedOrder.city && `, ${selectedOrder.city}`}
                          {selectedOrder.state && `, ${selectedOrder.state}`}
                          {selectedOrder.zip && ` ${selectedOrder.zip}`}
                          {selectedOrder.country &&
                            `, ${selectedOrder.country}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="space-y-2">
                <h3 className="font-semibold">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map(
                      (item: OrderItem, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-4 border rounded-lg"
                        >
                          {item.productImage && (
                            <Image
                              src={item.productImage || ""}
                              alt={item.productName || "Product"}
                              width={64}
                              height={64}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className="font-medium">
                              {item.productName || "Unknown Product"}
                            </h4>
                            {item.productBrand && (
                              <p className="text-sm text-muted-foreground">
                                Brand: {item.productBrand}
                              </p>
                            )}
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-sm">
                                Quantity: {item.quantity || 0}{" "}
                                {item.productUnit && `(${item.productUnit})`}
                              </span>
                              <span className="text-sm">
                                Price:{" "}
                                {item.price
                                  ? formatPrice(parseFloat(item.price))
                                  : "N/A"}
                              </span>
                              <span className="font-medium">
                                Total:{" "}
                                {item.total
                                  ? formatPrice(parseFloat(item.total))
                                  : "N/A"}
                              </span>
                            </div>
                            {item.variant && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Variant: {item.variant}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <p className="text-muted-foreground">
                      No items found for this order.
                    </p>
                  )}
                </div>
              </div>

              {/* Order Summary */}
              <div className="space-y-2">
                <h3 className="font-semibold">Order Summary</h3>
                <div className="space-y-1 p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>
                      {formatPrice(parseFloat(selectedOrder.subtotal))}
                    </span>
                  </div>
                  {selectedOrder.shipping &&
                    parseFloat(selectedOrder.shipping) > 0 && (
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span>
                          {formatPrice(parseFloat(selectedOrder.shipping))}
                        </span>
                      </div>
                    )}
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatPrice(parseFloat(selectedOrder.total))}</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="space-y-2">
                <h3 className="font-semibold">Payment Information</h3>
                <div className="space-y-1 p-4 bg-muted/50 rounded-lg">
                  <p>
                    <span className="text-sm text-muted-foreground">
                      Reference:
                    </span>{" "}
                    {selectedOrder.paymentReference}
                  </p>
                  <p>
                    <span className="text-sm text-muted-foreground">
                      Access Code:
                    </span>{" "}
                    {selectedOrder.paymentAccessCode}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Notes</h3>
                  <p className="p-4 bg-muted/50 rounded-lg">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Purchases;
