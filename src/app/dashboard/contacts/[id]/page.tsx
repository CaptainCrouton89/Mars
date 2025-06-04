"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Contact } from "@/types/database";
import {
  ArrowLeft,
  Calendar,
  Edit,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface ContactDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ContactDetailPage({
  params: paramsPromise,
}: ContactDetailPageProps) {
  const [params, setParams] = useState<{ id: string } | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    paramsPromise.then(setParams);
  }, [paramsPromise]);

  const fetchContact = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("id", params?.id)
        .single();

      if (error) throw error;
      setContact(data);
    } catch (error) {
      console.error("Error fetching contact:", error);
      router.push("/dashboard/contacts");
    } finally {
      setLoading(false);
    }
  }, [params?.id, router]);

  useEffect(() => {
    if (user && params?.id) {
      fetchContact();
    }
  }, [user, params?.id, fetchContact]);

  const handleDelete = async () => {
    if (
      !contact ||
      !confirm(
        "Are you sure you want to delete this contact? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", contact.id);

      if (error) throw error;
      router.push("/dashboard/contacts");
    } catch (error) {
      console.error("Error deleting contact:", error);
      setDeleting(false);
    }
  };

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  if (!contact) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-medium mb-2">
            Contact not found
          </h2>
          <p className="text-muted-foreground mb-6 text-sm">
            This contact may have been deleted or doesn&apos;t exist.
          </p>
          <Link href="/dashboard/contacts">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Contacts
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div
              className={`h-20 w-20 rounded-full ${getAvatarColor(
                contact
              )} flex items-center justify-center flex-shrink-0`}
            >
              <span className="text-2xl font-semibold text-white">
                {getContactInitials(contact)}
              </span>
            </div>

            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-1">
                {getContactDisplayName(contact)}
              </h1>
              {contact.company && (
                <p className="text-lg text-muted-foreground mb-1">
                  {contact.company}
                  {contact.role_title && ` · ${contact.role_title}`}
                </p>
              )}
              <div className="flex items-center gap-3 mt-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  VIP
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/opportunities/new?contactId=${contact.id}`}
            >
              <Button size="default" className="shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Create Opportunity
              </Button>
            </Link>
            <Link href={`/dashboard/contacts/${contact.id}/edit`}>
              <Button
                variant="outline"
                size="default"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="default"
              onClick={handleDelete}
              disabled={deleting}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-medium">
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {contact.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Email</p>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-sm text-foreground hover:text-primary transition-colors"
                    >
                      {contact.email}
                    </a>
                  </div>
                </div>
              )}

              {contact.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Phone</p>
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-sm text-foreground hover:text-primary transition-colors"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </div>
              )}

              {contact.address && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Address</p>
                    <p className="text-sm text-foreground">
                      {contact.address}
                    </p>
                  </div>
                </div>
              )}

              {contact.birthday && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Birthday</p>
                    <p className="text-sm text-foreground">
                      {formatDate(contact.birthday)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/dashboard/contacts" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Contacts
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contact.source && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Source</p>
                    <p className="text-sm">{contact.source}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Created</p>
                  <p className="text-sm">{formatDate(contact.created_at)}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Last Updated</p>
                  <p className="text-sm">{formatDate(contact.updated_at)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            {(contact.linkedin_url || contact.twitter_url || contact.website) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-medium">Social Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {contact.linkedin_url && (
                    <a
                      href={contact.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      LinkedIn
                    </a>
                  )}
                  {contact.twitter_url && (
                    <a
                      href={contact.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Twitter
                    </a>
                  )}
                  {contact.website && (
                    <a
                      href={contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                    </a>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Notes Section */}
        {contact.notes && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-base font-medium">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {contact.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
