import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Package, ShoppingCart } from "lucide-react";
import formatPrice from "@/lib/format-price";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: string;
    originalPrice?: string | null;
    quantity: number;
    unit: string;
    inStock: boolean;
    rating?: string | null;
    reviewCount?: number | null;
    badge?: string | null;
    images: Array<{ url: string }>;
  };
  showAddToCart?: boolean;
}

const ProductCard = ({ product, showAddToCart = true }: ProductCardProps) => {
  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200">
      <Link href={`/item/${product.id}`}>
        <CardContent className="p-0">
          <div className="aspect-square relative bg-gray-100 overflow-hidden rounded-t-lg">
            {product.images.length > 0 ? (
              <Image
                src={product.images[0].url}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
            )}

            {product.badge && (
              <Badge variant="destructive" className="absolute top-2 left-2">
                {product.badge}
              </Badge>
            )}

            {!product.inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="secondary">Out of Stock</Badge>
              </div>
            )}
          </div>

          <div className="p-4 space-y-2">
            <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">
                    {formatPrice(Number(product.price))}
                  </span>
                  {product.originalPrice &&
                    Number(product.originalPrice) > Number(product.price) && (
                      <span className="text-sm text-muted-foreground line-through">
                        {formatPrice(Number(product.originalPrice))}
                      </span>
                    )}
                </div>

                {product.rating && Number(product.rating) > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-muted-foreground">
                      {Number(product.rating).toFixed(1)} ({product.reviewCount}
                      )
                    </span>
                  </div>
                )}
              </div>

              {showAddToCart && (
                <Button
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="text-xs text-muted-foreground">
              {product.quantity} {product.unit} available
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export default ProductCard;
