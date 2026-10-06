"use client";

import { LogOut, ChevronDown } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface TopBarProps {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}

function TopBar({ user }: TopBarProps) {
  return (
    <header className="flex h-14 lg:h-[4.5rem] items-center sticky top-0 gap-4 border-b bg-background px-6">
      <div className="flex items-center">
        <SidebarTrigger />
        <div className=" border rounded-lg ml-4 w-[18rem]">
          <input
            type="text"
            placeholder="Search....."
            className="bg-transparent py-2 px-2 w-full outline-none"
          />
        </div>
      </div>
      <div className="flex flex-1 items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-auto gap-2 p-0.5 px-2 hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:text-accent-foreground group transition-colors"
            >
              <Avatar className="h-9 w-9 transition-transform group-hover:scale-105">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left lg:block">
                <div className="text-sm font-semibold tracking-tight">
                  {user.name}
                </div>
                <div className="text-xs text-muted-foreground/80">
                  {user.email}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export default TopBar;
