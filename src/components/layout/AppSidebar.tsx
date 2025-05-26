"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Briefcase,
  LogOut,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { name: "Contacts", href: "/dashboard/contacts", icon: Users },
  { name: "Opportunities", href: "/dashboard/opportunities", icon: Briefcase },
  {
    name: "Interactions",
    href: "/dashboard/interactions",
    icon: MessageSquare,
  },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r">
      <div className="flex h-16 items-center px-6 border-b">
        <h1 className="text-xl font-bold">Mars CRM</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start"
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">
                {user?.email?.[0]?.toUpperCase()}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
