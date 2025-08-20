"use client";

import { useState, useEffect } from "react";
import { Plus, Banknote, X, Loader } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UploadDropzone } from "@/lib/uploadthing";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Image from "next/image";
import { z } from "zod";
import formatPrice from "@/lib/format-price";
import { getCategories } from "@/actions/categories";
import {
  getProducts,
  createProduct,
  getSellerOrders,
} from "@/actions/products";

const productFormSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters."),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters."),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a valid positive number.",
  }),
  originalPrice: z.string().optional(),
  quantity: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
      message: "Quantity must be a valid number.",
    }),
  unit: z.string().min(1, "Please select a unit."),
  categoryId: z.string().min(1, "Please select a category."),
  brand: z.string().optional(),
  weight: z.string().optional(),
  dimensions: z.string().optional(),
  badge: z.string().optional(),
  images: z.array(z.string()).min(1, "Please upload at least one image."),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice: string | null;
  quantity: number;
  unit: string;
  inStock: boolean;
  rating: string | null;
  reviewCount: number | null;
  badge: string | null;
  categoryId: string;
  sellerId: string;
  createdAt: Date;
  category: {
    id: string;
    name: string;
  } | null;
  images: Array<{
    id: string;
    productId: string;
    url: string;
    alt: string | null;
    isPrimary: boolean | null;
    createdAt: Date;
  }>;
}

interface SellerOrder {
  id: string;
  orderId: string;
  quantity: number;
  price: string;
  total: string;
  variant: string | null;
  createdAt: Date;
  product: {
    id: string;
    name: string;
    price: string;
  } | null;
  order: {
    id: string;
    status: string;
    paymentStatus: string | null;
    shippingAddress: string | null;
    notes: string | null;
    createdAt: Date;
  } | null;
  customer: {
    id: string;
    name: string;
    email: string;
  } | null;
}

const SellPage = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [sellerOrders, setSellerOrders] = useState<SellerOrder[]>([]);
  const [loadingStates, setLoadingStates] = useState({
    categories: true,
    products: true,
    orders: true,
  });

  const getActiveTab = (): string => {
    const page = searchParams.get("page");
    return page === "add" || page === "view" || page === "orders"
      ? page
      : "view";
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  useEffect(() => {
    const page = searchParams.get("page");
    const currentTab =
      page === "add" || page === "view" || page === "orders" ? page : "view";
    setActiveTab(currentTab);
  }, [searchParams]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load categories
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        setLoadingStates((prev) => ({ ...prev, categories: false }));

        // Load user products
        const productsData = await getProducts({
          page: 1,
          limit: 50,
          sellerId: userId,
          sortBy: "newest",
        });
        setUserProducts(productsData.items);
        setLoadingStates((prev) => ({ ...prev, products: false }));

        // Load seller orders
        const ordersData = await getSellerOrders({
          page: 1,
          limit: 50,
        });
        setSellerOrders(ordersData);
        setLoadingStates((prev) => ({ ...prev, orders: false }));
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load data");
        setLoadingStates({ categories: false, products: false, orders: false });
      }
    };

    loadData();
  }, [userId]);

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", value);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      quantity: "",
      unit: "",
      categoryId: "",
      brand: "",
      weight: "",
      dimensions: "",
      badge: "",
      images: [],
    },
  });

  async function onSubmit(values: ProductFormData) {
    if (uploadedImages.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setIsSubmitting(true);
    try {
      await createProduct({
        name: values.name,
        description: values.description,
        price: parseFloat(values.price),
        originalPrice: values.originalPrice
          ? parseFloat(values.originalPrice)
          : undefined,
        quantity: parseInt(values.quantity),
        unit: values.unit,
        categoryId: values.categoryId,
        brand: values.brand,
        weight: values.weight,
        dimensions: values.dimensions,
        badge: values.badge,
        images: uploadedImages,
      });

      toast.success("Product Added", {
        description: "Your product has been successfully listed.",
      });

      form.reset();
      setUploadedImages([]);

      // Reload user products
      const productsData = await getProducts({
        page: 1,
        limit: 50,
        sellerId: userId,
        sortBy: "newest",
      });
      setUserProducts(productsData.items);

      handleTabChange("view");
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Error", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to create product. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const removeImage = (indexToRemove: number) => {
    const updatedImages = uploadedImages.filter(
      (_, index) => index !== indexToRemove
    );
    setUploadedImages(updatedImages);
    form.setValue("images", updatedImages);
  };

  return (
    <div className="container max-w-7xl mx-auto p-6 mt-16">
      <h1 className="text-3xl font-bold mb-6">Manage Your Products</h1>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="view">View Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="add">Add Product</TabsTrigger>
        </TabsList>

        <TabsContent value="view">
          <Card>
            <CardHeader>
              <CardTitle>Your Listed Products</CardTitle>
              <CardDescription>
                Products you have listed for sale
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingStates.products ? (
                <div className="flex justify-center items-center h-full">
                  <Loader className="animate-spin" />
                </div>
              ) : userProducts && userProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="p-4"
                      style={{
                        backgroundImage: product.images[0]
                          ? `url(${product.images[0].url})`
                          : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                      }}
                    >
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {product.description.substring(0, 100)}...
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold">
                          {formatPrice(Number(product.price))}
                        </span>
                        <span
                          className={`text-sm ${
                            product.inStock ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {product.inStock
                            ? `${product.quantity} in stock`
                            : "Out of stock"}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  You haven&apos;t listed any products yet.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Product Orders</CardTitle>
              <CardDescription>Orders containing your products</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingStates.orders ? (
                <div className="flex justify-center items-center h-full">
                  <Loader className="animate-spin" />
                </div>
              ) : sellerOrders && sellerOrders.length > 0 ? (
                <div className="space-y-4">
                  {sellerOrders.map((orderItem) => (
                    <Card key={orderItem.id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">
                            {orderItem.product?.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Order ID: {orderItem.orderId}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {formatPrice(Number(orderItem.total))}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {orderItem.quantity} ×{" "}
                            {formatPrice(Number(orderItem.price))}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p>
                            <strong>Customer:</strong>{" "}
                            {orderItem.customer?.name}
                          </p>
                          <p>
                            <strong>Email:</strong> {orderItem.customer?.email}
                          </p>
                          <p>
                            <strong>Quantity:</strong> {orderItem.quantity}
                          </p>
                          {orderItem.variant && (
                            <p>
                              <strong>Variant:</strong> {orderItem.variant}
                            </p>
                          )}
                        </div>
                        <div>
                          <p>
                            <strong>Order Status:</strong>
                            <span
                              className={`ml-2 px-2 py-1 rounded text-xs ${
                                orderItem.order?.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : orderItem.order?.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : orderItem.order?.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {orderItem.order?.status || "pending"}
                            </span>
                          </p>
                          <p>
                            <strong>Payment:</strong>
                            <span
                              className={`ml-2 px-2 py-1 rounded text-xs ${
                                orderItem.order?.paymentStatus === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : orderItem.order?.paymentStatus === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {orderItem.order?.paymentStatus || "pending"}
                            </span>
                          </p>
                          <p>
                            <strong>Ordered:</strong>{" "}
                            {new Date(orderItem.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {orderItem.order?.shippingAddress && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm">
                            <strong>Shipping Address:</strong>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {orderItem.order.shippingAddress}
                          </p>
                        </div>
                      )}

                      {orderItem.order?.notes && (
                        <div className="mt-2">
                          <p className="text-sm">
                            <strong>Order Notes:</strong>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {orderItem.order.notes}
                          </p>
                        </div>
                      )}
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
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Product</CardTitle>
              <CardDescription>
                Fill out the form below to list a new product for sale.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={form.control}
                    name="images"
                    render={() => (
                      <FormItem>
                        <FormLabel>Product Images</FormLabel>
                        <FormDescription>
                          Upload product images (max 4MB each)
                        </FormDescription>

                        <UploadDropzone
                          endpoint="imageUploader"
                          onClientUploadComplete={(res) => {
                            if (res) {
                              const newImages = res.map((file) => file.url);
                              const updatedImages = [
                                ...uploadedImages,
                                ...newImages,
                              ];
                              setUploadedImages(updatedImages);
                              form.setValue("images", updatedImages);
                              toast.success("Images uploaded successfully!");
                            }
                          }}
                          onUploadError={(error: Error) => {
                            toast.error(`Upload error: ${error.message}`);
                          }}
                        />

                        {uploadedImages.length > 0 && (
                          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {uploadedImages.map((url, index) => (
                              <div key={index} className="relative group">
                                <Image
                                  src={url}
                                  width={200}
                                  height={200}
                                  alt={`Product image ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-md shadow-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                                {index === 0 && (
                                  <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-md text-xs">
                                    Main Image
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Organic Tomatoes"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={loadingStates.categories}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    loadingStates.categories
                                      ? "Loading..."
                                      : "Select a category"
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.id}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="originalPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Original Price (Optional)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                className="pl-10"
                                {...field}
                                value={field.value || ""}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Set if this product is on sale
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="e.g. 100"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="kg">Kilogram (kg)</SelectItem>
                              <SelectItem value="lb">Pound (lb)</SelectItem>
                              <SelectItem value="piece">Piece</SelectItem>
                              <SelectItem value="dozen">Dozen</SelectItem>
                              <SelectItem value="liter">Liter</SelectItem>
                              <SelectItem value="bushel">Bushel</SelectItem>
                              <SelectItem value="crate">Crate</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="brand"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Your Farm Name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 500g, 2kg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your product, including quality, origin, farming methods, etc."
                            className="resize-none"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Provide details about your product to help customers
                          make informed decisions.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto"
                  >
                    {isSubmitting ? (
                      "Adding Product..."
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" /> Add Product
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SellPage;
