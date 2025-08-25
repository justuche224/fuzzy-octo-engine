"use client";

import { useState, useEffect } from "react";
import {
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  AlertTriangle,
  Search,
  MoreHorizontal,
  Eye,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import formatPrice from "@/lib/format-price";
import {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  toggleUserStatus,
} from "@/actions/user";
import {
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderDetails,
} from "@/actions/products";
import Image from "next/image";

interface AdminStats {
  totalUsers: number;
  totalSellers: number;
  totalAdmins: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCategories: number;
  recentUsers: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string | null;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  productCount: number;
  orderCount: number;
}

interface Order {
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
  notes: string | null;
  paymentReference: string;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: string;
    name: string;
    email: string;
  } | null;
  itemCount: number;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: string;
  total: string;
  variant: string | null;
  createdAt: Date;
  product: {
    id: string;
    name: string;
    description: string | null;
    price: string;
    unit: string;
    brand: string | null;
  };
  productImage: string | null;
  seller: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface OrderDetails {
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
  paymentReference: string;
  createdAt: Date;
  updatedAt: Date;
  customer: {
    id: string;
    name: string;
    email: string;
  } | null;
  items: OrderItem[];
}

export default function AdminDashboard() {
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);

  const [loadingStates, setLoadingStates] = useState({
    stats: true,
    users: true,
    orders: true,
    orderDetails: false,
  });

  const [errors, setErrors] = useState({
    stats: null as string | null,
    users: null as string | null,
    orders: null as string | null,
    orderDetails: null as string | null,
  });

  const [pagination, setPagination] = useState({
    users: { page: 1, totalPages: 1, totalCount: 0 },
    orders: { page: 1, totalPages: 1, totalCount: 0 },
  });

  const [filters, setFilters] = useState({
    users: { search: "", role: "all" },
    orders: { search: "", status: "all", paymentStatus: "all" },
  });

  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  // Load admin stats
  useEffect(() => {
    const loadAdminStats = async () => {
      try {
        const stats = await getAdminStats();
        setAdminStats(stats);
        setErrors((prev) => ({ ...prev, stats: null }));
      } catch (error) {
        console.error("Error loading admin stats:", error);
        setErrors((prev) => ({
          ...prev,
          stats: "Failed to load admin statistics",
        }));
      } finally {
        setLoadingStates((prev) => ({ ...prev, stats: false }));
      }
    };

    loadAdminStats();
  }, []);

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      setLoadingStates((prev) => ({ ...prev, users: true }));
      try {
        const usersData = await getAllUsers({
          page: pagination.users.page,
          limit: 10,
          search: filters.users.search || undefined,
          role:
            filters.users.role === "all"
              ? undefined
              : (filters.users.role as "USER" | "SELLER" | "ADMIN"),
        });
        setUsers(usersData.users);
        setPagination((prev) => ({
          ...prev,
          users: {
            page: usersData.currentPage,
            totalPages: usersData.totalPages,
            totalCount: usersData.totalCount,
          },
        }));
        setErrors((prev) => ({ ...prev, users: null }));
      } catch (error) {
        console.error("Error loading users:", error);
        setErrors((prev) => ({
          ...prev,
          users: "Failed to load users",
        }));
      } finally {
        setLoadingStates((prev) => ({ ...prev, users: false }));
      }
    };

    loadUsers();
  }, [pagination.users.page, filters.users.search, filters.users.role]);

  // Load orders
  useEffect(() => {
    const loadOrders = async () => {
      setLoadingStates((prev) => ({ ...prev, orders: true }));
      try {
        const ordersData = await getAllOrders({
          page: pagination.orders.page,
          limit: 10,
          search: filters.orders.search || undefined,
          status:
            filters.orders.status === "all"
              ? undefined
              : (filters.orders.status as
                  | "pending"
                  | "completed"
                  | "cancelled"),
          paymentStatus:
            filters.orders.paymentStatus === "all"
              ? undefined
              : (filters.orders.paymentStatus as "pending" | "paid" | "failed"),
        });
        setOrders(ordersData.orders);
        setPagination((prev) => ({
          ...prev,
          orders: {
            page: ordersData.currentPage,
            totalPages: ordersData.totalPages,
            totalCount: ordersData.totalCount,
          },
        }));
        setErrors((prev) => ({ ...prev, orders: null }));
      } catch (error) {
        console.error("Error loading orders:", error);
        setErrors((prev) => ({
          ...prev,
          orders: "Failed to load orders",
        }));
      } finally {
        setLoadingStates((prev) => ({ ...prev, orders: false }));
      }
    };

    loadOrders();
  }, [
    pagination.orders.page,
    filters.orders.search,
    filters.orders.status,
    filters.orders.paymentStatus,
  ]);

  const handleUserRoleUpdate = async (
    userId: string,
    role: "USER" | "SELLER" | "ADMIN"
  ) => {
    try {
      await updateUserRole({ userId, role });
      toast.success("User role updated successfully");
      // Reload users
      const usersData = await getAllUsers({
        page: pagination.users.page,
        limit: 10,
        search: filters.users.search || undefined,
        role:
          filters.users.role === "all"
            ? undefined
            : (filters.users.role as "USER" | "SELLER" | "ADMIN"),
      });
      setUsers(usersData.users);
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  const handleUserStatusToggle = async (
    userId: string,
    emailVerified: boolean
  ) => {
    try {
      await toggleUserStatus({ userId, emailVerified });
      toast.success("User status updated successfully");
      // Reload users
      const usersData = await getAllUsers({
        page: pagination.users.page,
        limit: 10,
        search: filters.users.search || undefined,
        role:
          filters.users.role === "all"
            ? undefined
            : (filters.users.role as "USER" | "SELLER" | "ADMIN"),
      });
      setUsers(usersData.users);
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleOrderStatusUpdate = async (
    orderId: string,
    status: "pending" | "completed" | "cancelled"
  ) => {
    try {
      await updateOrderStatus({ orderId, status });
      toast.success("Order status updated successfully");
      // Reload orders
      const ordersData = await getAllOrders({
        page: pagination.orders.page,
        limit: 10,
        search: filters.orders.search || undefined,
        status:
          filters.orders.status === "all"
            ? undefined
            : (filters.orders.status as "pending" | "completed" | "cancelled"),
        paymentStatus:
          filters.orders.paymentStatus === "all"
            ? undefined
            : (filters.orders.paymentStatus as "pending" | "paid" | "failed"),
      });
      setOrders(ordersData.orders);
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const handlePaymentStatusUpdate = async (
    orderId: string,
    paymentStatus: "pending" | "paid" | "failed"
  ) => {
    try {
      await updatePaymentStatus({ orderId, paymentStatus });
      toast.success("Payment status updated successfully");
      // Reload orders
      const ordersData = await getAllOrders({
        page: pagination.orders.page,
        limit: 10,
        search: filters.orders.search || undefined,
        status:
          filters.orders.status === "all"
            ? undefined
            : (filters.orders.status as "pending" | "completed" | "cancelled"),
        paymentStatus:
          filters.orders.paymentStatus === "all"
            ? undefined
            : (filters.orders.paymentStatus as "pending" | "paid" | "failed"),
      });
      setOrders(ordersData.orders);
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast.error("Failed to update payment status");
    }
  };

  const handleViewOrderDetails = async (orderId: string) => {
    setLoadingStates((prev) => ({ ...prev, orderDetails: true }));
    try {
      const orderDetails = await getOrderDetails(orderId);
      setSelectedOrder(orderDetails);
      setIsOrderDetailsOpen(true);
      setErrors((prev) => ({ ...prev, orderDetails: null }));
    } catch (error) {
      console.error("Error loading order details:", error);
      setErrors((prev) => ({
        ...prev,
        orderDetails: "Failed to load order details",
      }));
      toast.error("Failed to load order details");
    } finally {
      setLoadingStates((prev) => ({ ...prev, orderDetails: false }));
    }
  };

  return (
    <div className="container max-w-7xl mx-auto p-6 mt-16">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStates.stats ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : errors.stats ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.stats}</AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {adminStats?.totalUsers}
                </div>
                <p className="text-xs text-muted-foreground">
                  {adminStats?.recentUsers} new this month
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStates.stats ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : errors.stats ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.stats}</AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {adminStats?.totalOrders}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all sellers
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStates.stats ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            ) : errors.stats ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.stats}</AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatPrice(adminStats?.totalRevenue || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  From paid orders
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingStates.stats ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ) : errors.stats ? (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.stats}</AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {adminStats?.totalProducts}
                </div>
                <p className="text-xs text-muted-foreground">
                  {adminStats?.totalSellers} sellers •{" "}
                  {adminStats?.totalCategories} categories
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="orders">Order Management</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Manage platform users and their roles
              </CardDescription>

              {/* User Filters */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={filters.users.search}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        users: { ...prev.users, search: e.target.value },
                      }))
                    }
                    className="pl-8"
                  />
                </div>
                <Select
                  value={filters.users.role}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      users: { ...prev.users, role: value },
                    }))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="SELLER">Seller</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loadingStates.users ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : errors.users ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{errors.users}</AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.role === "ADMIN"
                                ? "default"
                                : user.role === "SELLER"
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {user.role || "USER"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.emailVerified ? "default" : "destructive"
                            }
                          >
                            {user.emailVerified ? "Verified" : "Unverified"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {user.productCount} products • {user.orderCount}{" "}
                            orders
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUserRoleUpdate(user.id, "USER")
                                }
                              >
                                Set as User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUserRoleUpdate(user.id, "SELLER")
                                }
                              >
                                Set as Seller
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUserRoleUpdate(user.id, "ADMIN")
                                }
                              >
                                Set as Admin
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUserStatusToggle(
                                    user.id,
                                    !user.emailVerified
                                  )
                                }
                              >
                                {user.emailVerified ? "Unverify" : "Verify"}{" "}
                                Email
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* User Pagination */}
              {!loadingStates.users && !errors.users && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {users.length} of {pagination.users.totalCount}{" "}
                    users
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.users.page <= 1}
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          users: { ...prev.users, page: prev.users.page - 1 },
                        }))
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        pagination.users.page >= pagination.users.totalPages
                      }
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          users: { ...prev.users, page: prev.users.page + 1 },
                        }))
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                Manage platform orders and payments
              </CardDescription>

              {/* Order Filters */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    value={filters.orders.search}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        orders: { ...prev.orders, search: e.target.value },
                      }))
                    }
                    className="pl-8"
                  />
                </div>
                <Select
                  value={filters.orders.status}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      orders: { ...prev.orders, status: value },
                    }))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.orders.paymentStatus}
                  onValueChange={(value) =>
                    setFilters((prev) => ({
                      ...prev,
                      orders: { ...prev.orders, paymentStatus: value },
                    }))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Payments</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {loadingStates.orders ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : errors.orders ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{errors.orders}</AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              #{order.id.slice(-8).toUpperCase()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {order.itemCount} items
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {order.customer?.name || order.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {order.customer?.email || order.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "completed"
                                ? "default"
                                : order.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.paymentStatus === "paid"
                                ? "default"
                                : order.paymentStatus === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {order.paymentStatus || "pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatPrice(Number(order.total))}
                        </TableCell>
                        <TableCell>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleViewOrderDetails(order.id)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handleOrderStatusUpdate(order.id, "pending")
                                }
                              >
                                Set Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleOrderStatusUpdate(order.id, "completed")
                                }
                              >
                                Set Completed
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleOrderStatusUpdate(order.id, "cancelled")
                                }
                              >
                                Set Cancelled
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  handlePaymentStatusUpdate(order.id, "pending")
                                }
                              >
                                Payment Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handlePaymentStatusUpdate(order.id, "paid")
                                }
                              >
                                Mark Paid
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handlePaymentStatusUpdate(order.id, "failed")
                                }
                              >
                                Mark Failed
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Order Pagination */}
              {!loadingStates.orders && !errors.orders && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {orders.length} of {pagination.orders.totalCount}{" "}
                    orders
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.orders.page <= 1}
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          orders: {
                            ...prev.orders,
                            page: prev.orders.page - 1,
                          },
                        }))
                      }
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={
                        pagination.orders.page >= pagination.orders.totalPages
                      }
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          orders: {
                            ...prev.orders,
                            page: prev.orders.page + 1,
                          },
                        }))
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order Details Modal */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Order Details #{selectedOrder?.orderId.slice(-8).toUpperCase()}
            </DialogTitle>
            <DialogDescription>
              Complete order information and items
            </DialogDescription>
          </DialogHeader>

          {loadingStates.orderDetails ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : errors.orderDetails ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errors.orderDetails}</AlertDescription>
            </Alert>
          ) : (
            selectedOrder && (
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
                                : selectedOrder.paymentStatus === "pending"
                                ? "secondary"
                                : "destructive"
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
                        <div className="flex justify-between">
                          <span>Payment Reference:</span>
                          <span className="font-mono text-xs">
                            {selectedOrder.paymentReference}
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
                        {selectedOrder.country && (
                          <p>{selectedOrder.country}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Order Total</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>
                            {formatPrice(Number(selectedOrder.subtotal))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping:</span>
                          <span>
                            {formatPrice(Number(selectedOrder.shipping || 0))}
                          </span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>Total:</span>
                          <span>
                            {formatPrice(Number(selectedOrder.total))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-semibold mb-4">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item: OrderItem) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-4 p-4 border rounded-lg"
                      >
                        {item.productImage && (
                          <Image
                            src={item.productImage}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded"
                            width={64}
                            height={64}
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-medium">
                                {item.product.name}
                              </h5>
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
                              <p className="text-sm text-muted-foreground">
                                Seller: {item.seller?.name} (
                                {item.seller?.email})
                              </p>
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
                  <div>
                    <h4 className="font-semibold mb-2">Order Notes</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
