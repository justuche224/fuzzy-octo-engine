import React from "react";
import { getSavedProducts } from "@/actions/user";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Saved = async () => {
  const savedProducts = await getSavedProducts(1, 20);

  if (savedProducts.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center max-w-7xl mx-auto">
        <Heart className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No saved products yet</h2>
        <p className="text-muted-foreground mb-4">
          Start saving products you love by clicking the heart icon on product
          pages.
        </p>
        <Button asChild>
          <Link href="/">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 container mx-auto max-w-7xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Favorites</h1>
        <p className="text-muted-foreground">
          {savedProducts.totalCount} product
          {savedProducts.totalCount !== 1 ? "s" : ""} saved
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {savedProducts.items.map((product) => (
          <Card
            key={product.id}
            className="group hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-4">
              <Link href={`/item/${product.id}`}>
                <div className="aspect-square relative bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  <Image
                    src={product.images || "/image.png"}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                  />
                  {product.badge && (
                    <Badge
                      variant="destructive"
                      className="absolute top-2 left-2 text-xs"
                    >
                      {product.badge}
                    </Badge>
                  )}
                  {product.originalPrice && (
                    <Badge
                      variant="secondary"
                      className="absolute top-2 right-2 text-xs"
                    >
                      {Math.round(
                        ((Number(product.originalPrice) -
                          Number(product.price)) /
                          Number(product.originalPrice)) *
                          100
                      )}
                      % OFF
                    </Badge>
                  )}
                </div>
              </Link>

              <div className="space-y-2">
                <Link href={`/item/${product.id}`}>
                  <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>

                <div className="flex items-center gap-2">
                  <span className="font-bold">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-xs text-muted-foreground line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>

                {product.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-muted-foreground">
                      {product.rating} ({product.reviewCount || 0})
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {product.quantity} {product.unit} available
                  </span>
                  <span>
                    Saved {new Date(product.savedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Saved;
