"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";
import { useNavigationLoading } from "./navigation-loading";

function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathName = usePathname();
  const { startNavigation } = useNavigationLoading();
  const { state } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isOpen = item.items?.some((subItem) => subItem.url === pathName) || item.isActive;

          if (state === "collapsed") {
            return (
              <SidebarMenuItem key={item.title} className="my-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className="h-11 justify-center" tooltip={item.title}>
                      {item.icon && <item.icon className="!h-5 !w-5" />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side="right" align="start" className="w-56">
                    <DropdownMenuLabel>{item.title}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {item.items?.map((subItem) => (
                      <DropdownMenuItem key={subItem.title} asChild>
                        <Link
                          href={subItem.url}
                          onClick={() => {
                            if (subItem.url !== pathName) startNavigation();
                          }}
                          className={subItem.url === pathName ? "font-semibold text-primary" : ""}
                        >
                          {subItem.title}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            );
          }

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isOpen}
              className="group/collapsible"
            >
              <SidebarMenuItem className="my-1">
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className="text-md h-11 after:hidden group-data-[state=open]/collapsible:after:flex group-data-[state=open]/collapsible:bg-gray-200 after:content-[''] after:absolute after:w-6 after:h-12 relative after:bg-primary after:right-0 overflow-hidden"
                    tooltip={item.title}
                  >
                    {item.icon && <item.icon className="!h-5 !w-5" />}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto z-10 transition-transform duration-200 group-data-[state=open]/collapsible:-mr-1 group-data-[state=open]/collapsible:rotate-90 group-data-[state=open]/collapsible:text-white" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild>
                          <Link
                            href={subItem.url}
                            onClick={() => {
                              if (subItem.url !== pathName) startNavigation();
                            }}
                          >
                            <span
                              className={`${
                                subItem.url === pathName &&
                                "text-primary font-semibold"
                              }`}
                            >
                              {subItem.title}
                            </span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default NavMain;
