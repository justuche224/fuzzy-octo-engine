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
  IconHome,
  IconHome2,
} from "@tabler/icons-react";

// import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
// import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, isPending, error } = authClient.useSession();
  const pathname = usePathname();
  const data = {
    user: {
      name: isPending
        ? "Loading..."
        : error
        ? "Error"
        : session?.user?.name || "Guest",
      email: isPending
        ? "Loading..."
        : error
        ? "Error"
        : session?.user?.email || "Guest",
      avatar: isPending
        ? "Loading..."
        : error
        ? "Error"
        : session?.user?.image || "/avatars/shadcn.jpg",
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
        isActive: pathname === "/dashboard/my-listings",
      },
      {
        title: "List Item",
        url: "/dashboard/list-item",
        icon: IconPlus,
        isActive: pathname === "/dashboard/list-item",
      },
      {
        title: "My Store View",
        url: isPending ? "#" : error ? "#" : `/seller/${session?.user?.id}`,
        icon: IconHome2,
        isActive:
          isPending || error
            ? false
            : pathname === `/seller/${session?.user?.id}`,
      },
      {
        title: "My Sales",
        url: "/dashboard/my-sales",
        icon: IconChartBar,
        isActive: pathname === "/dashboard/my-sales",
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
      {
        title: "Home",
        url: "/",
        icon: IconHome,
        isActive: pathname === "/",
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
              <Link href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Milky Way</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavDocuments items={data.documents} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>{/* <NavUser user={data.user} /> */}</SidebarFooter>
    </Sidebar>
  );
}
