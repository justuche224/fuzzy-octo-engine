import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  Store,
  User,
} from "lucide-react";
import { getProduct, getProductReviews, getProducts } from "@/actions/products";
import { notFound } from "next/navigation";

const ProductPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  let product;
  try {
    product = await getProduct(id);
  } catch {
    notFound();
  }

  const [reviews, relatedProducts] = await Promise.all([
    getProductReviews({ productId: id, page: 1, limit: 5 }),
    getProducts({
      page: 1,
      limit: 4,
      categoryId: product.categoryId,
      sortBy: "featured",
    }),
  ]);

  const primaryImage =
    product.images.find((img) => img.isPrimary) || product.images[0];
  const otherImages = product.images.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          <div className="aspect-square relative bg-gray-100 rounded-xl overflow-hidden">
            <Image
              src={primaryImage?.url || "/image.png"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {product.badge && (
              <Badge variant="destructive" className="absolute top-4 left-4">
                {product.badge}
              </Badge>
            )}
            {product.originalPrice && (
              <Badge variant="destructive" className="absolute top-4 right-4">
                {Math.round(
                  ((Number(product.originalPrice) - Number(product.price)) /
                    Number(product.originalPrice)) *
                    100
                )}
                % OFF
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {otherImages.map((image, index) => (
              <div
                key={image.id || index}
                className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary cursor-pointer"
              >
                <Image
                  src={image.url || "/image.png"}
                  alt={`${product.name} view ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              {product.brand && <span>{product.brand}</span>}
              {product.brand && product.category && <span>•</span>}
              {product.category && <span>{product.category.name}</span>}
            </div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`w-5 h-5 ${
                      index < Math.floor(Number(product.rating) || 0)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating || "0"} ({product.reviewCount || 0} reviews)
              </span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold">${product.price}</span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-6">
              {product.inStock ? (
                <Badge
                  variant="secondary"
                  className="text-green-600 bg-green-50"
                >
                  In Stock ({product.quantity} {product.unit} available)
                </Badge>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>

            {/* Seller Information */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={product.seller?.image || ""} />
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {product.seller?.name || "Unknown Seller"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {product.farmerProfile?.farmName ||
                          "Marketplace Seller"}
                      </p>
                      {product.farmerProfile?.location && (
                        <p className="text-xs text-muted-foreground">
                          📍 {product.farmerProfile.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <Link href={`/seller/${product.sellerId}`}>
                    <Button variant="outline" size="sm">
                      <Store className="w-4 h-4 mr-2" />
                      Visit Store
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3">
              <Button size="lg" className="flex-1">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="w-5 h-5" />
              </Button>
            </div>

            <Button variant="outline" size="lg" className="w-full">
              Buy Now
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Truck className="w-5 h-5 text-muted-foreground" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <RotateCcw className="w-5 h-5 text-muted-foreground" />
              <span>30-day Returns</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <span>2-year Warranty</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="description" className="mb-12">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          {product.variants && product.variants.length > 0 && (
            <TabsTrigger value="variants">Variants</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="description" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground leading-relaxed mb-6">
                {product.description}
              </p>

              {product.brand && (
                <div className="mb-4">
                  <h3 className="font-semibold mb-2">Brand:</h3>
                  <p className="text-muted-foreground">{product.brand}</p>
                </div>
              )}

              {(product.weight || product.dimensions) && (
                <div>
                  <h3 className="font-semibold mb-3">Product Details:</h3>
                  <ul className="space-y-2">
                    {product.weight && (
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span>Weight: {product.weight}</span>
                      </li>
                    )}
                    {product.dimensions && (
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span>Dimensions: {product.dimensions}</span>
                      </li>
                    )}
                    {product.sku && (
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span>SKU: {product.sku}</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specifications" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium">Price:</span>
                  <span className="text-muted-foreground">
                    ${product.price}
                  </span>
                </div>
                {product.originalPrice && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium">Original Price:</span>
                    <span className="text-muted-foreground">
                      ${product.originalPrice}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium">Category:</span>
                  <span className="text-muted-foreground">
                    {product.category?.name}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium">Stock:</span>
                  <span className="text-muted-foreground">
                    {product.quantity} {product.unit}
                  </span>
                </div>
                {product.brand && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium">Brand:</span>
                    <span className="text-muted-foreground">
                      {product.brand}
                    </span>
                  </div>
                )}
                {product.weight && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium">Weight:</span>
                    <span className="text-muted-foreground">
                      {product.weight}
                    </span>
                  </div>
                )}
                {product.dimensions && (
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="font-medium">Dimensions:</span>
                    <span className="text-muted-foreground">
                      {product.dimensions}
                    </span>
                  </div>
                )}
                {product.sku && (
                  <div className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                    <span className="font-medium">SKU:</span>
                    <span className="text-muted-foreground">{product.sku}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-100 last:border-0 pb-6 last:pb-0"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar>
                          <AvatarImage src={review.user?.image || ""} />
                          <AvatarFallback>
                            <User className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {review.user?.name || "Anonymous"}
                          </p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, starIndex) => (
                              <Star
                                key={starIndex}
                                className={`w-4 h-4 ${
                                  starIndex < review.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          {review.verified && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                      </div>
                      {review.title && (
                        <h4 className="font-medium mb-1">{review.title}</h4>
                      )}
                      <p className="text-muted-foreground">{review.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No reviews yet. Be the first to review this product!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {product.variants && product.variants.length > 0 && (
          <TabsContent value="variants" className="mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-4">
                  {product.variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="flex justify-between items-center p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{variant.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {variant.value}
                        </p>
                      </div>
                      <Badge
                        variant={
                          variant.available ? "secondary" : "destructive"
                        }
                      >
                        {variant.available ? "Available" : "Out of Stock"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <div>
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {relatedProducts.items
            .filter((p) => p.id !== product.id)
            .slice(0, 4)
            .map((relatedProduct) => (
              <Link key={relatedProduct.id} href={`/item/${relatedProduct.id}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-square relative bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <Image
                        src={relatedProduct.images?.[0]?.url || "/image.png"}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover"
                      />
                      {relatedProduct.badge && (
                        <Badge
                          variant="destructive"
                          className="absolute top-2 left-2 text-xs"
                        >
                          {relatedProduct.badge}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-medium text-sm line-clamp-2 mb-2">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">${relatedProduct.price}</span>
                      {relatedProduct.originalPrice && (
                        <span className="text-xs text-muted-foreground line-through">
                          ${relatedProduct.originalPrice}
                        </span>
                      )}
                    </div>
                    {relatedProduct.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-muted-foreground">
                          {relatedProduct.rating} (
                          {relatedProduct.reviewCount || 0})
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
