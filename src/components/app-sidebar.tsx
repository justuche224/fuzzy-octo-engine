"use client";

import * as React from "react";
import { GalleryVerticalEnd } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { InputWithButton } from "./search-bar";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");
  const price = searchParams.get("price");

  const createUrl = (paramName: string, paramValue: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(paramName, paramValue);
    return `/?${params.toString()}`;
  };

  const data = {
    navMain: [
      {
        title: "Getting Started",
        url: "#",
        items: [
          {
            title: "Installation",
            url: "#",
          },
          {
            title: "Clear Filters",
            url: "/",
          },
        ],
      },
      {
        title: "Categories",
        url: "#",
        items: [
          {
            title: "Electronics",
            url: createUrl("category", "electronics"),
            isActive: category === "electronics",
          },
          {
            title: "Clothing",
            url: createUrl("category", "clothing"),
            isActive: category === "clothing",
          },
          {
            title: "Books",
            url: createUrl("category", "books"),
            isActive: category === "books",
          },
          {
            title: "Furniture",
            url: createUrl("category", "furniture"),
            isActive: category === "furniture",
          },
          {
            title: "Toys",
            url: createUrl("category", "toys"),
            isActive: category === "toys",
          },
          {
            title: "Shoes",
            url: createUrl("category", "shoes"),
            isActive: category === "shoes",
          },
          {
            title: "Jewelry",
            url: createUrl("category", "jewelry"),
            isActive: category === "jewelry",
          },
          {
            title: "Sports",
            url: createUrl("category", "sports"),
            isActive: category === "sports",
          },
          {
            title: "Automotive",
            url: createUrl("category", "automotive"),
            isActive: category === "automotive",
          },
          {
            title: "Health",
            url: createUrl("category", "health"),
            isActive: category === "health",
          },
          {
            title: "Beauty",
            url: createUrl("category", "beauty"),
            isActive: category === "beauty",
          },
          {
            title: "Home",
            url: createUrl("category", "home"),
            isActive: category === "home",
          },
          {
            title: "Garden",
            url: createUrl("category", "garden"),
            isActive: category === "garden",
          },
          {
            title: "Pet Supplies",
            url: createUrl("category", "pet-supplies"),
            isActive: category === "pet-supplies",
          },
          {
            title: "Baby",
            url: createUrl("category", "baby"),
            isActive: category === "baby",
          },
        ],
      },
      {
        title: "Brands",
        url: "#",
        items: [
          {
            title: "Apple",
            url: createUrl("brand", "apple"),
            isActive: brand === "apple",
          },
          {
            title: "Samsung",
            url: createUrl("brand", "samsung"),
            isActive: brand === "samsung",
          },
          {
            title: "Home Made",
            url: createUrl("brand", "home-made"),
            isActive: brand === "home-made",
          },
          {
            title: "Nike",
            url: createUrl("brand", "nike"),
            isActive: brand === "nike",
          },
          {
            title: "Adidas",
            url: createUrl("brand", "adidas"),
            isActive: brand === "adidas",
          },
          {
            title: "Puma",
            url: createUrl("brand", "puma"),
            isActive: brand === "puma",
          },
          {
            title: "Under Armour",
            url: createUrl("brand", "under-armour"),
            isActive: brand === "under-armour",
          },
        ],
      },
      {
        title: "Price",
        url: "#",
        items: [
          {
            title: "Under $10",
            url: createUrl("price", "under-10"),
            isActive: price === "under-10",
          },
          {
            title: "Under $50",
            url: createUrl("price", "under-50"),
            isActive: price === "under-50",
          },
          {
            title: "Under $100",
            url: createUrl("price", "under-100"),
            isActive: price === "under-100",
          },
          {
            title: "Over $100",
            url: createUrl("price", "over-100"),
            isActive: price === "over-100",
          },

          {
            title: "Over $500",
            url: createUrl("price", "over-500"),
            isActive: price === "over-500",
          },
        ],
      },
      {
        title: "Community",
        url: "#",
        items: [
          {
            title: "Contribution Guide",
            url: "#",
          },
        ],
      },
    ],
  };

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Documentation</span>
                  <span className="">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu className="hidden md:block w-full">
          <InputWithButton />
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <Link
                    href={item.url}
                    className="font-semibold text-xl hover:text-primary"
                  >
                    {item.title}
                  </Link>
                </SidebarMenuButton>
                {item.items?.length ? (
                  <SidebarMenuSub className="ml-0 border-l-0 px-1.5">
                    {item.items.map((item) => (
                      <SidebarMenuSubItem key={item.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={"isActive" in item ? item.isActive : false}
                        >
                          <Link href={item.url}>{item.title}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
