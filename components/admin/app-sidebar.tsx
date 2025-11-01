"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { FolderClosed, Home, ShoppingBasket, Store, Users } from "lucide-react";
import { NavUser } from "@/components/nav-user";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const items = [
  {
    title: "Inicio",
    url: "/dashboard/admin",
    icon: Home,
  },
  {
    title: "Usuários",
    url: "/dashboard/admin/users",
    icon: Users,
  },
  {
    title: "Postos",
    url: "/dashboard/admin/stations",
    icon: Store,
  },
  {
    title: "Categorias",
    url: "/dashboard/admin/categories",
    icon: FolderClosed,
  },
  {
    title: "Produtos",
    url: "/dashboard/admin/products",
    icon: ShoppingBasket,
  },
];

export function AdminSidebar() {
  const { data: session, isPending } = authClient.useSession();
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div
          className={cn(
            "flex items-center justify-between",
            state === "collapsed" && "flex-col"
          )}>
          <h1
            className={cn(
              "text-xl font-bold",
              state === "collapsed" && "text-center"
            )}>
            {state === "expanded" ? "FreshTrack" : "FT"}
          </h1>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {isPending ? (
          <div className="flex items-center gap-3 px-2 py-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            {state === "expanded" && (
              <div className="flex flex-col gap-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            )}
          </div>
        ) : (
          <NavUser
            name={session?.user.name}
            email={session?.user.email}
            image={session?.user.image}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
