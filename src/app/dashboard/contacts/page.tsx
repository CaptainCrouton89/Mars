"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Contact } from "@/types/database";
import {
  Building,
  Filter,
  Grid3X3,
  List,
  Mail,
  Phone,
  Plus,
  Search,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      contact.first_name?.toLowerCase().includes(searchLower) ||
      contact.last_name?.toLowerCase().includes(searchLower) ||
      contact.email?.toLowerCase().includes(searchLower) ||
      contact.company?.toLowerCase().includes(searchLower)
    );
  });

  const getContactDisplayName = (contact: Contact) => {
    const name = [contact.first_name, contact.last_name]
      .filter(Boolean)
      .join(" ");
    return name || contact.email || "Unnamed Contact";
  };

  const getContactInitials = (contact: Contact) => {
    const firstName = contact.first_name || "";
    const lastName = contact.last_name || "";
    return (firstName[0] + lastName[0]).toUpperCase() || "?";
  };

  const getAvatarColor = (contact: Contact) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-orange-500",
    ];
    const index = (contact.id?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              Contacts
            </h1>
            <p className="text-muted-foreground">
              {filteredContacts.length} {filteredContacts.length === 1 ? "contact" : "contacts"} in your network
            </p>
          </div>
          <Link href="/dashboard/contacts/new">
            <Button size="lg" className="shadow-sm hover:shadow-md transition-shadow">
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </Link>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <Button variant="outline" size="default" className="shadow-sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 px-3"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Empty State */}
        {filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {searchTerm ? "No matches found" : "No contacts yet"}
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm text-center mb-6">
              {searchTerm
                ? "Try adjusting your search"
                : "Start building your network by adding your first contact"}
            </p>
            {!searchTerm && (
              <Link href="/dashboard/contacts/new">
                <Button className="shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </Link>
            )}
          </div>
        ) : (
          /* Contact Grid/List */
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "space-y-3"
            }
          >
            {filteredContacts.map((contact) => (
              <Link key={contact.id} href={`/dashboard/contacts/${contact.id}`}>
                <Card
                  className={`group hover:shadow-md transition-all duration-200 cursor-pointer border-border/50 hover:border-border ${
                    viewMode === "list" ? "flex flex-row" : "h-full flex flex-col"
                  }`}
                >
                  <CardHeader
                    className={
                      viewMode === "list"
                        ? "flex-row items-center space-y-0 space-x-4 p-4"
                        : "p-4 pb-3"
                    }
                  >
                    <div
                      className={`flex items-center ${
                        viewMode === "list" ? "space-x-4" : "space-x-4"
                      }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`relative ${
                          viewMode === "list" ? "h-12 w-12" : "h-10 w-10"
                        }`}
                      >
                        <div
                          className={`h-full w-full rounded-full ${getAvatarColor(
                            contact
                          )} flex items-center justify-center`}
                        >
                          <span
                            className={`${
                              viewMode === "list" ? "text-sm" : "text-xs"
                            } font-medium text-white`}
                          >
                            {getContactInitials(contact)}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <CardTitle
                          className={`${
                            viewMode === "list" ? "text-base" : "text-sm"
                          } font-medium truncate`}
                        >
                          {getContactDisplayName(contact)}
                        </CardTitle>
                        {contact.company && (
                          <p
                            className={`${
                              viewMode === "list" ? "text-sm" : "text-xs"
                            } text-muted-foreground truncate mt-0.5`}
                          >
                            {contact.company}
                          </p>
                        )}
                        {contact.role_title && viewMode === "list" && (
                          <p className="text-xs text-muted-foreground truncate">
                            {contact.role_title}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent
                    className={`${
                      viewMode === "list" ? "flex-1 p-4 py-0 flex items-center" : "p-4 pt-0 flex-grow flex flex-col justify-between"
                    }`}
                  >
                    <div
                      className={`${
                        viewMode === "list"
                          ? "flex items-center gap-6 flex-1"
                          : "space-y-2"
                      }`}
                    >
                      {contact.email && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Mail className="h-3 w-3 mr-2" />
                          <span className="truncate">{contact.email}</span>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Phone className="h-3 w-3 mr-2" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                      {contact.role_title && viewMode === "grid" && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Building className="h-3 w-3 mr-2" />
                          <span className="truncate">{contact.role_title}</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {viewMode === "grid" && (
                      <div className="flex gap-1.5 mt-3">
                        <div className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                          Active
                        </div>
                        {contact.company && (
                          <div className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
                            Business
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
