"use client";

import * as React from "react";
import {
  AlignVerticalDistributeStart,
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  LayoutDashboard,
  Map,
  Newspaper,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import NavMain from "./nav-main";
import TeamSwitcher from "./team-switcher";

// This is sample data.
const data = {
  user: {
    name: "E-commerce",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "E-commerce",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Analytics",
          url: "/",
        },
        {
          title: "Orders",
          url: "/order/list",
        },
        {
          title: "Sales",
          url: "/sales/analytics",
        },
        {
          title: "Users",
          url: "/users/list",
        },
        {
          title: "Notifications",
          url: "/notifications",
        },
      ],
    },
    {
      title: "Products",
      url: "#",
      isActive: true,
      icon: AlignVerticalDistributeStart,
      items: [
        {
          title: "product List",
          url: "/products/list",
        },
        {
          title: "Create product",
          url: "/products/create",
        },
        {
          title: "Discounts",
          url: "/products/discounts",
        },
        {
          title: "Categories",
          url: "/category",
        },
        {
          title: "Banners",
          url: "/banners",
        },
      ],
    },
    {
      title: "Blog",
      url: "#",
      icon: Newspaper,
      items: [
        {
          title: "Blog List",
          url: "/blog/list",
        },
        {
          title: "Create blog",
          url: "/blog/create",
        },
        {
          title: "Categories",
          url: "/blog/categories",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Shipping Methods",
          url: "/settings/shipping-methods",
        },

        {
          title: "Payments",
          url: "/settings/payments",
        },
        {
          title: "Profile",
          url: "/settings/profile",
        },

      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      {...props}
      variant="inset"
      className="bg-white z-[999s]"
    >
      <SidebarHeader className="">
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>{/* <NavUser user={data.user} /> */}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
