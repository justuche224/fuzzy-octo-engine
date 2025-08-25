"use client";

import { useState, useEffect } from "react";
import { Loader, Eye, Package, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import formatPrice from "@/lib/format-price";
import { getSellerOrders, getSellerOrderDetails } from "@/actions/products";
import Image from "next/image";

interface SellerOrderItem {
  id: string;
  quantity: number;
  price: string;
  total: string;
  variant: string | null;
  createdAt: Date;
  product: {
    id: string;
    name: string;
    price: string;
    unit: string;
    brand: string | null;
  };
  productImage: string | null;
}

interface SellerOrder {
  orderId: string;
  status: string;
  paymentStatus: string | null;
  total: string;
  subtotal: string;
  shipping: string | null;
  shippingAddress: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  name: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: string;
    name: string;
    email: string;
  } | null;
  items: SellerOrderItem[];
  sellerTotal: number;
  sellerItemCount: number;
  isPartialOrder?: boolean;
}

const SalesPage = ({ userId }: { userId: string }) => {
  const [sellerOrders, setSellerOrders] = useState<SellerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<SellerOrder | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const ordersData = await getSellerOrders({
          page: 1,
          limit: 50,
        });
        setSellerOrders(ordersData);
      } catch (error) {
        console.error("Error loading orders:", error);
        toast.error("Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [userId]);

  const handleViewOrderDetails = async (orderId: string) => {
    setLoadingOrderDetails(true);
    try {
      const orderDetails = await getSellerOrderDetails({ orderId });
      setSelectedOrder(orderDetails);
      setIsOrderDetailsOpen(true);
    } catch (error) {
      console.error("Error loading order details:", error);
      toast.error("Failed to load order details");
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  return (
    <div className="container max-w-7xl mx-auto p-6 mt-16">
      <h1 className="text-3xl font-bold mb-6">My Sales</h1>

      <Card>
        <CardHeader>
          <CardTitle>Orders with Your Products</CardTitle>
          <CardDescription>
            Orders containing your products (showing only your items)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader className="animate-spin" />
            </div>
          ) : sellerOrders && sellerOrders.length > 0 ? (
            <div className="space-y-4">
              {sellerOrders.map((order) => (
                <Card key={order.orderId} className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-lg">
                          Order #{order.orderId.slice(-8).toUpperCase()}
                        </h4>
                        <Badge
                          variant={
                            order.status === "completed"
                              ? "default"
                              : order.status === "pending"
                              ? "secondary"
                              : order.status === "cancelled"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {order.status}
                        </Badge>
                        <Badge
                          variant={
                            order.paymentStatus === "paid"
                              ? "default"
                              : order.paymentStatus === "pending"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {order.paymentStatus || "pending"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Customer: {order.customer?.name || order.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Ordered:{" "}
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-bold text-lg">
                        {formatPrice(order.sellerTotal)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Your portion
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Total order: {formatPrice(Number(order.total))}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>
                        <strong>{order.sellerItemCount}</strong> items from you
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{order.customer?.email || order.email}</span>
                    </div>
                    <div className="text-right md:text-left">
                      <Dialog
                        open={isOrderDetailsOpen}
                        onOpenChange={setIsOrderDetailsOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleViewOrderDetails(order.orderId)
                            }
                            disabled={loadingOrderDetails}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            {loadingOrderDetails
                              ? "Loading..."
                              : "View Details"}
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-medium">Your Items in this Order:</h5>
                    {order.items.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-sm bg-muted/50 p-2 rounded"
                      >
                        <span>
                          {item.product.name}
                          {item.variant && ` (${item.variant})`}
                        </span>
                        <span>
                          {item.quantity} × {formatPrice(Number(item.price))} ={" "}
                          {formatPrice(Number(item.total))}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{order.items.length - 3} more items...
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              No orders found for your products yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Order Details #{selectedOrder?.orderId.slice(-8).toUpperCase()}
            </DialogTitle>
            <DialogDescription>
              Detailed view of your items in this order
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Order Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge
                          variant={
                            selectedOrder.status === "completed"
                              ? "default"
                              : selectedOrder.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {selectedOrder.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Payment:</span>
                        <Badge
                          variant={
                            selectedOrder.paymentStatus === "paid"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {selectedOrder.paymentStatus || "pending"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Order Date:</span>
                        <span>
                          {new Date(selectedOrder.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Customer</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Name:</strong>{" "}
                        {selectedOrder.customer?.name || selectedOrder.name}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {selectedOrder.customer?.email || selectedOrder.email}
                      </p>
                      {selectedOrder.phone && (
                        <p>
                          <strong>Phone:</strong> {selectedOrder.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Shipping Address</h4>
                    <div className="text-sm space-y-1">
                      {selectedOrder.shippingAddress && (
                        <p>{selectedOrder.shippingAddress}</p>
                      )}
                      <p>
                        {[
                          selectedOrder.city,
                          selectedOrder.state,
                          selectedOrder.zip,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      {selectedOrder.country && <p>{selectedOrder.country}</p>}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">
                      Order Total Breakdown
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Order Value:</span>
                        <span>{formatPrice(Number(selectedOrder.total))}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Your Portion:</span>
                        <span>{formatPrice(selectedOrder.sellerTotal)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Your Items:</span>
                        <span>{selectedOrder.sellerItemCount} items</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Items */}
              <div>
                <h4 className="font-semibold mb-4">Your Items in this Order</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 p-4 border rounded-lg"
                    >
                      {item.productImage && (
                        <Image
                          src={item.productImage}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-medium">{item.product.name}</h5>
                            {item.product.brand && (
                              <p className="text-sm text-muted-foreground">
                                Brand: {item.product.brand}
                              </p>
                            )}
                            {item.variant && (
                              <p className="text-sm text-muted-foreground">
                                Variant: {item.variant}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {formatPrice(Number(item.total))}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} ×{" "}
                              {formatPrice(Number(item.price))}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedOrder.notes && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2">Order Notes</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.notes}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesPage;
