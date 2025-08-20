"use client";

import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconCash,
  IconHeart,
  IconPlus,
} from "@tabler/icons-react";

// import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname, useSearchParams } from "next/navigation";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  console.log(`${pathname}?page=${searchParams.get("page")}`);
  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: IconDashboard,
        isActive: pathname === "/dashboard",
      },
      {
        title: "My Listings",
        url: "/dashboard/my-listings",
        icon: IconListDetails,
        isActive:
          pathname === "/dashboard/my-listings" &&
          (!searchParams.get("page") || searchParams.get("page") === "view"),
      },
      {
        title: "List Item",
        url: "/dashboard/my-listings?page=add",
        icon: IconPlus,
        isActive:
          pathname === "/dashboard/my-listings" &&
          searchParams.get("page") === "add",
      },
      {
        title: "My Sales",
        url: "/dashboard/my-listings?page=orders",
        icon: IconChartBar,
        isActive:
          pathname === "/dashboard/my-listings" &&
          searchParams.get("page") === "orders",
      },
      {
        title: "My Purchases",
        url: "/dashboard/my-purchases",
        icon: IconCash,
        isActive: pathname === "/dashboard/my-purchases",
      },
      {
        title: "My Favorites",
        url: "/dashboard/my-favorites",
        icon: IconHeart,
        isActive: pathname === "/dashboard/my-favorites",
      },
    ],
    navClouds: [
      {
        title: "Capture",
        icon: IconCamera,
        isActive: true,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
            isActive: pathname === "/capture/active-proposals",
          },
          {
            title: "Archived",
            url: "#",
            isActive: pathname === "/capture/archived",
          },
        ],
      },
      {
        title: "Proposal",
        icon: IconFileDescription,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
            isActive: pathname === "/proposal/active-proposals",
          },
          {
            title: "Archived",
            url: "#",
            isActive: pathname === "/proposal/archived",
          },
        ],
      },
      {
        title: "Prompts",
        icon: IconFileAi,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
            isActive: pathname === "/prompts/active-proposals",
          },
          {
            title: "Archived",
            url: "#",
            isActive: pathname === "/prompts/archived",
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: IconSettings,
        isActive: pathname === "/settings",
      },
      {
        title: "Get Help",
        url: "#",
        icon: IconHelp,
        isActive: pathname === "/help",
      },
      {
        title: "Search",
        url: "#",
        icon: IconSearch,
        isActive: pathname === "/search",
      },
    ],
    documents: [
      {
        name: "Data Library",
        url: "#",
        icon: IconDatabase,
        isActive: pathname === "/data-library",
      },
      {
        name: "Reports",
        url: "#",
        icon: IconReport,
        isActive: pathname === "/reports",
      },
      {
        name: "Word Assistant",
        url: "#",
        icon: IconFileWord,
        isActive: pathname === "/word-assistant",
      },
    ],
  };
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
