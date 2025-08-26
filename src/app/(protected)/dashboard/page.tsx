"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Heart,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import {
  getDashboardStats,
  getDashboardPurchases,
  getDashboardSavedProducts,
} from "@/actions/user";
import {
  getDashboardSalesStats,
  getDashboardRecentActivity,
} from "@/actions/products";
import formatPrice from "@/lib/format-price";

interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
}

interface PurchaseStats {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  completedOrders: number;
}

interface SavedStats {
  totalSaved: number;
}

interface SalesStats {
  totalSales: number;
  totalOrders: number;
  totalItemsSold: number;
  pendingSales: number;
  completedSales: number;
  paidSales: number;
  recentSales: number;
  recentOrders: number;
}

interface RecentActivity {
  orderId: string;
  orderStatus: string;
  orderTotal: string;
  customerName: string | null;
  customerEmail: string | null;
  createdAt: Date;
  itemTotal: string;
  itemQuantity: number;
  productName: string;
}

export default function Page() {
  const [productStats, setProductStats] = useState<ProductStats | null>(null);
  const [purchaseStats, setPurchaseStats] = useState<PurchaseStats | null>(
    null
  );
  const [savedStats, setSavedStats] = useState<SavedStats | null>(null);
  const [salesStats, setSalesStats] = useState<SalesStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[] | null>(
    null
  );

  const [loadingStates, setLoadingStates] = useState({
    products: true,
    purchases: true,
    saved: true,
    sales: true,
    activity: true,
  });

  const [errors, setErrors] = useState({
    products: null as string | null,
    purchases: null as string | null,
    saved: null as string | null,
    sales: null as string | null,
    activity: null as string | null,
  });

  // Load product stats
  useEffect(() => {
    const loadProductStats = async () => {
      try {
        const stats = await getDashboardStats();
        setProductStats(stats);
        setErrors((prev) => ({ ...prev, products: null }));
      } catch (error) {
        console.error("Error loading product stats:", error);
        setErrors((prev) => ({
          ...prev,
          products: "Failed to load product statistics",
        }));
      } finally {
        setLoadingStates((prev) => ({ ...prev, products: false }));
      }
    };

    loadProductStats();
  }, []);

  // Load purchase stats
  useEffect(() => {
    const loadPurchaseStats = async () => {
      try {
        const stats = await getDashboardPurchases();
        setPurchaseStats(stats);
        setErrors((prev) => ({ ...prev, purchases: null }));
      } catch (error) {
        console.error("Error loading purchase stats:", error);
        setErrors((prev) => ({
          ...prev,
          purchases: "Failed to load purchase statistics",
        }));
      } finally {
        setLoadingStates((prev) => ({ ...prev, purchases: false }));
      }
    };

    loadPurchaseStats();
  }, []);

  // Load saved products stats
  useEffect(() => {
    const loadSavedStats = async () => {
      try {
        const stats = await getDashboardSavedProducts();
        setSavedStats(stats);
        setErrors((prev) => ({ ...prev, saved: null }));
      } catch (error) {
        console.error("Error loading saved stats:", error);
        setErrors((prev) => ({
          ...prev,
          saved: "Failed to load saved products statistics",
        }));
      } finally {
        setLoadingStates((prev) => ({ ...prev, saved: false }));
      }
    };

    loadSavedStats();
  }, []);

  // Load sales stats
  useEffect(() => {
    const loadSalesStats = async () => {
      try {
        const stats = await getDashboardSalesStats();
        setSalesStats(stats);
        setErrors((prev) => ({ ...prev, sales: null }));
      } catch (error) {
        console.error("Error loading sales stats:", error);
        setErrors((prev) => ({
          ...prev,
          sales: "Failed to load sales statistics",
        }));
      } finally {
        setLoadingStates((prev) => ({ ...prev, sales: false }));
      }
    };

    loadSalesStats();
  }, []);

  // Load recent activity
  useEffect(() => {
    const loadRecentActivity = async () => {
      try {
        const activity = await getDashboardRecentActivity();
        setRecentActivity(activity);
        setErrors((prev) => ({ ...prev, activity: null }));
      } catch (error) {
        console.error("Error loading recent activity:", error);
        setErrors((prev) => ({
          ...prev,
          activity: "Failed to load recent activity",
        }));
      } finally {
        setLoadingStates((prev) => ({ ...prev, activity: false }));
      }
    };

    loadRecentActivity();
  }, []);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 container mx-auto max-w-7xl">
      <div>
        <h1 className="text-2xl lg:text-4xl font-bold">Dashboard</h1>
      </div>
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Product Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStates.products ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : errors.products ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.products}</AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {productStats?.totalProducts}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">
                    {productStats?.activeProducts} active
                  </span>
                  {productStats?.outOfStockProducts ? (
                    <span className="text-orange-600 ml-2">
                      {productStats.outOfStockProducts} out of stock
                    </span>
                  ) : null}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Sales Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStates.sales ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            ) : errors.sales ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.sales}</AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatPrice(salesStats?.totalSales || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {salesStats?.totalOrders} orders •{" "}
                  {salesStats?.totalItemsSold} items sold
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Purchase Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Your Purchases
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStates.purchases ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : errors.purchases ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.purchases}</AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {purchaseStats?.totalOrders}
                </div>
                <p className="text-xs text-muted-foreground">
                  Spent: {formatPrice(purchaseStats?.totalSpent || 0)}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Saved Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saved Products
            </CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStates.saved ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-4 w-20" />
              </div>
            ) : errors.saved ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.saved}</AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {savedStats?.totalSaved}
                </div>
                <p className="text-xs text-muted-foreground">
                  Products in wishlist
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Sales Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sales Breakdown</CardTitle>
            <CardDescription>Revenue and payment status</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingStates.sales ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : errors.sales ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.sales}</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Paid Sales</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium">
                      {formatPrice(salesStats?.paidSales || 0)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pending Sales</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">
                      {formatPrice(salesStats?.pendingSales || 0)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completed Sales</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">
                      {formatPrice(salesStats?.completedSales || 0)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-medium">Last 30 Days</span>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatPrice(salesStats?.recentSales || 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {salesStats?.recentOrders} orders
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Purchase Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Purchase History</CardTitle>
            <CardDescription>Your buying activity</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingStates.purchases ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            ) : errors.purchases ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.purchases}</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completed Orders</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium">
                      {purchaseStats?.completedOrders}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pending Orders</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">
                      {purchaseStats?.pendingOrders}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm font-medium">Total Spent</span>
                  <span className="font-medium">
                    {formatPrice(purchaseStats?.totalSpent || 0)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest sales and orders</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingStates.activity ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            ) : errors.activity ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.activity}</AlertDescription>
              </Alert>
            ) : recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.orderId} className="space-y-1">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {activity.productName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.customerName || activity.customerEmail}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {formatPrice(Number(activity.itemTotal))}
                        </p>
                        <Badge
                          variant={
                            activity.orderStatus === "completed"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {activity.orderStatus}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleDateString()} • Qty:{" "}
                      {activity.itemQuantity}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent activity
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
