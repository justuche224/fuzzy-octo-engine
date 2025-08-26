import React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProductCard from "@/components/product-card";
import {
  MapPin,
  Phone,
  Globe,
  Award,
  Calendar,
  Package,
  Verified,
} from "lucide-react";
import { getSellerProfileWithProducts } from "@/actions/user";

interface PublicProfileProps {
  profileID: string;
}

const PublicProfile = async ({ profileID }: PublicProfileProps) => {
  let sellerData;

  try {
    sellerData = await getSellerProfileWithProducts(profileID);
  } catch (error) {
    console.error(error);
    return (
      <div className="container max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-muted-foreground">
            Seller Not Found
          </h1>
          <p className="text-muted-foreground mt-2">
            The seller profile you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  const { seller, products } = sellerData;
  const profile = seller.profile;
  const user = seller.user;

  const avatarUrl = profile?.avatar || user.image;
  const displayName = profile?.farmName || user.name;

  return (
    <div className="min-h-screen bg-background">
      {profile?.banner && (
        <div className="relative w-full h-64 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
          <Image
            src={profile.banner}
            alt="Seller Banner"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}

      <div className="container max-w-6xl mx-auto px-6">
        <div className="relative">
          <div className={`${profile?.banner ? "-mt-20" : "pt-8"} pb-8`}>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={avatarUrl || ""} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {displayName?.charAt(0) || "S"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold text-foreground">
                      {displayName}
                    </h1>
                    {profile?.verified && (
                      <Badge
                        variant="default"
                        className="flex items-center gap-1"
                      >
                        <Verified className="h-3 w-3" />
                        Verified Seller
                      </Badge>
                    )}
                  </div>

                  {profile?.description && (
                    <p className="text-muted-foreground text-lg max-w-2xl">
                      {profile.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {profile?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </div>

                  <div className="flex items-center gap-1">
                    <Package className="h-4 w-4" />
                    {products.items.length} Products
                  </div>
                </div>

                {profile?.certifications && (
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm">{profile.certifications}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-6 pb-12">
        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>

                {profile?.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <p className="font-medium">{profile.phone}</p>
                    </div>
                  </div>
                )}

                {profile?.website && (
                  <div>
                    <p className="text-sm text-muted-foreground">Website</p>
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Products</h2>
                <Badge variant="secondary">
                  {products.items.length} Products Available
                </Badge>
              </div>

              {products.items.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Products Yet
                    </h3>
                    <p className="text-muted-foreground">
                      This seller hasn&apos;t listed any products yet.
                    </p>
                  </CardContent>
                </Card>
              )}

              {products.pagination.hasMore && (
                <div className="text-center">
                  <Button variant="outline">Load More Products</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
