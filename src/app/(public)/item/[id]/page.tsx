import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";

const ProductPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  const mockProduct = {
    id,
    name: "Premium Wireless Headphones",
    price: 199.99,
    originalPrice: 249.99,
    rating: 4.5,
    reviewCount: 1248,
    inStock: true,
    category: "Electronics",
    brand: "AudioTech",
    images: ["/image.png"],
    description:
      "Experience crystal-clear audio with our premium wireless headphones. Featuring advanced noise cancellation technology, 30-hour battery life, and superior comfort for all-day wear.",
    features: [
      "Active Noise Cancellation",
      "30-hour battery life",
      "Bluetooth 5.0 connectivity",
      "Premium leather cushions",
      "Quick charge - 5 min for 3 hours",
    ],
    specifications: {
      "Driver Size": "40mm",
      "Frequency Response": "20Hz - 20kHz",
      Impedance: "32 ohms",
      Weight: "250g",
      "Bluetooth Version": "5.0",
      "Battery Life": "30 hours",
      "Charging Time": "2 hours",
      "Quick Charge": "5 min = 3 hours",
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          <div className="aspect-square relative bg-gray-100 rounded-xl overflow-hidden">
            <Image
              src={mockProduct.images[0]}
              alt={mockProduct.name}
              fill
              className="object-cover"
              priority
            />
            <Badge variant="destructive" className="absolute top-4 left-4">
              {Math.round(
                ((mockProduct.originalPrice - mockProduct.price) /
                  mockProduct.originalPrice) *
                  100
              )}
              % OFF
            </Badge>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary cursor-pointer"
              >
                <Image
                  src="/image.png"
                  alt={`${mockProduct.name} view ${index + 1}`}
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
              <span>{mockProduct.brand}</span>
              <span>•</span>
              <span>{mockProduct.category}</span>
            </div>
            <h1 className="text-3xl font-bold mb-4">{mockProduct.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`w-5 h-5 ${
                      index < Math.floor(mockProduct.rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {mockProduct.rating} ({mockProduct.reviewCount} reviews)
              </span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-bold">${mockProduct.price}</span>
              <span className="text-xl text-muted-foreground line-through">
                ${mockProduct.originalPrice}
              </span>
            </div>

            <div className="flex items-center gap-2 mb-6">
              {mockProduct.inStock ? (
                <Badge
                  variant="secondary"
                  className="text-green-600 bg-green-50"
                >
                  In Stock
                </Badge>
              ) : (
                <Badge variant="destructive">Out of Stock</Badge>
              )}
            </div>
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
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground leading-relaxed mb-6">
                {mockProduct.description}
              </p>

              <div>
                <h3 className="font-semibold mb-3">Key Features:</h3>
                <ul className="space-y-2">
                  {mockProduct.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specifications" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(mockProduct.specifications).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between py-2 border-b border-gray-100 last:border-0"
                    >
                      <span className="font-medium">{key}:</span>
                      <span className="text-muted-foreground">{value}</span>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-100 last:border-0 pb-6 last:pb-0"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                      <div>
                        <p className="font-medium">User {index + 1}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <Star
                              key={starIndex}
                              className={`w-4 h-4 ${
                                starIndex < 4
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground">
                      Great quality headphones! The sound is amazing and the
                      battery life is as advertised. Highly recommend for anyone
                      looking for premium audio experience.
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div>
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-4">
                <div className="aspect-square relative bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  <Image
                    src="/image.png"
                    alt={`Related product ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="font-medium text-sm line-clamp-2 mb-2">
                  Related Product {index + 1}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="font-bold">
                    ${(99.99 + index * 20).toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground line-through">
                    ${(129.99 + index * 20).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
