"use client";

import { useState, useEffect } from "react";
import { Loader } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";
import formatPrice from "@/lib/format-price";
import { getProducts } from "@/actions/products";

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

const ListingsPage = ({ userId }: { userId: string }) => {
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await getProducts({
          page: 1,
          limit: 50,
          sellerId: userId,
          sortBy: "newest",
        });
        setUserProducts(productsData.items);
      } catch (error) {
        console.error("Error loading products:", error);
        toast.error("Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [userId]);

  return (
    <div className="container max-w-7xl mx-auto p-6 mt-16">
      <h1 className="text-3xl font-bold mb-6">My Listings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Your Listed Products</CardTitle>
          <CardDescription>Products you have listed for sale</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader className="animate-spin" />
            </div>
          ) : userProducts && userProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {userProducts.map((product) => (
                <div
                  key={product.id}
                  className="w-full h-full shadow-md rounded-md py-2 bg-background flex flex-col"
                >
                  <CardHeader className="flex-1">
                    <Image
                      src={product.images[0].url}
                      alt={product.name}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  </CardHeader>
                  <CardContent>
                    <CardTitle>{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">
                        {formatPrice(Number(product.price))}
                      </span>
                    </div>
                  </CardContent>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              You haven&apos;t listed any products yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ListingsPage;
