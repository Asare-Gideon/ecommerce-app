"use client";

import { Bell, CheckCheck, CircleAlert, CircleCheck, Clock, Store } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "./ui/sidebar";
import { useAuthStore } from "@/store/authStore";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationItem, useNotificationStore } from "@/store/notificationStore";
import { cn } from "@/lib/utils";

interface AppBarProps {
  onMenuClick?: () => void;
}

export default function AppBar({ onMenuClick }: AppBarProps) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const { logoutUser } = useAuth();
  const { notifications, unreadCount } = useNotificationStore();
  const { fetchNotifications, markNotificationRead, markAllNotificationsRead } = useNotifications();

  useEffect(() => {
    fetchNotifications("all", 8);
    const interval = window.setInterval(() => fetchNotifications("all", 8), 30000);
    return () => window.clearInterval(interval);
  }, [token]);

  const getSeverityIcon = (notification: NotificationItem) => {
    if (notification.severity === "success") return <CircleCheck className="h-4 w-4 text-emerald-600" />;
    if (notification.severity === "warning" || notification.severity === "error") {
      return <CircleAlert className="h-4 w-4 text-amber-600" />;
    }
    return <Clock className="h-4 w-4 text-blue-600" />;
  };

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        <SidebarTrigger />

        <div className="ml-4 min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-muted-foreground">
            Admin workspace
          </p>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <Button variant="ghost" size="sm" asChild>
            <Link href="#" className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              Visit Site
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end" forceMount>
              <div className="flex items-center justify-between px-2 py-1.5">
                <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={markAllNotificationsRead}
                  disabled={unreadCount === 0}
                >
                  <CheckCheck className="mr-1 h-3.5 w-3.5" />
                  Mark read
                </Button>
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length === 0 && (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No notifications yet.
                  </div>
                )}
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification._id} asChild>
                    <Link
                      href={notification.link || "#"}
                      onClick={() => markNotificationRead(notification._id)}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 p-4",
                        !notification.isRead && "bg-emerald-50/60"
                      )}
                    >
                      <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
                        {getSeverityIcon(notification)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium">{notification.title}</p>
                          {!notification.isRead && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                        </div>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full ring-2 ring-border hover:ring-emerald-500 transition-all"
              >
                <Avatar>
                  {/* <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="@shadcn"
                  /> */}
                  <AvatarFallback>
                    {user ? user.firstName[0] + user.lastName[0] : ""}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user ? user.firstName + " " + user.lastName : ""}
                  </p>
                  <p className="text-xs leading-none text-emerald-500">Admin</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await logoutUser();
                }}
                className="text-red-500"
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
