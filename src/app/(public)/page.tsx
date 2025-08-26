export const dynamic = "force-dynamic";

import React from "react";
import { InputWithButton } from "@/components/search-bar";
import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/actions/products";
import {
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import formatPrice from "@/lib/format-price";
import AddToCart from "@/cart/add-to-cart";

const Home = async () => {
  const dealsData = await getProducts({
    page: 1,
    limit: 50,
    sortBy: "featured",
  });

  const ProductCard = ({
    product,
  }: {
    product: (typeof dealsData.items)[0];
  }) => (
    <div
      key={product.id}
      className="w-full h-full shadow-md rounded-md py-2 flex flex-col bg-card hover:bg-card/80 transition-all duration-300 group px-0"
    >
      <CardHeader className="flex-1">
        <Link href={`/item/${product.id}`}>
          <Image
            src={product.images[0].url}
            alt={product.name}
            width={100}
            height={100}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 aspect-square"
          />
        </Link>
      </CardHeader>
      <CardContent>
        <Link href={`/item/${product.id}`}>
          <CardTitle className="line-clamp-1">{product.name}</CardTitle>
          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
            {product.description}
          </p>
          <div className="flex justify-between items-center">
            <span className="font-bold">
              {formatPrice(Number(product.price))}
            </span>
          </div>
        </Link>
      </CardContent>
      <CardFooter>
        <AddToCart
          product={{
            slug: product.id,
            name: product.name,
            price: Number(product.price),
            trackQuantity: product.inStock,
            inStock: product.quantity,
            images: product.images,
            sellerId: product.sellerId,
          }}
        />
      </CardFooter>
    </div>
  );

  return (
    <section className="container mx-auto max-w-7xl px-2">
      <div className="mb-4 text-center">
        <h1 className="text-2xl lg:text-4xl font-bold my-4">
          Welcome to the Milky Way Marketplace
        </h1>
        <p className="text-muted-foreground max-md:text-xs">
          Explore our wide range of products and find the best deals for you.
        </p>
        <p className="text-muted-foreground max-md:text-xs">
          To list a product visit the{" "}
          <Link href="/auth" className="text-primary">
            Seller Registration
          </Link>{" "}
          page.
        </p>
      </div>
      <div className="w-full flex justify-center mb-4">
        <InputWithButton />
      </div>
      <div>
        <h2 className="text-2xl font-bold my-4">Today&apos;s Deals</h2>
        <div>
          <div className="grid gap-4 max-sm:[grid-template-columns:repeat(auto-fill,minmax(130px,1fr))] [grid-template-columns:repeat(auto-fill,minmax(200px,1fr))]">
            {dealsData.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;
