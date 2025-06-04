"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Building,
  Calendar,
  Globe,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const contactSchema = z
  .object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z
      .string()
      .email("Invalid email address")
      .optional()
      .or(z.literal("")),
    phone: z.string().optional(),
    company: z.string().optional(),
    role_title: z.string().optional(),
    notes: z.string().optional(),
    source: z.string().optional(),
    linkedin_url: z.string().url("Invalid URL").optional().or(z.literal("")),
    twitter_url: z.string().url("Invalid URL").optional().or(z.literal("")),
    website: z.string().url("Invalid URL").optional().or(z.literal("")),
    address: z.string().optional(),
    birthday: z.string().optional(),
  })
  .refine((data) => data.first_name || data.last_name || data.email, {
    message: "At least one of first name, last name, or email is required",
    path: ["first_name"],
  });

type ContactFormData = z.infer<typeof contactSchema>;

export default function NewContactPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const contactData = {
        ...data,
        user_id: user.id,
        email: data.email || null,
        linkedin_url: data.linkedin_url || null,
        twitter_url: data.twitter_url || null,
        website: data.website || null,
        birthday: data.birthday || null,
      };

      const { error } = await supabase.from("contacts").insert([contactData]);

      if (error) throw error;

      router.push("/dashboard/contacts");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-border shadow-[6px_6px_0_0_hsl(var(--border))] p-8">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/dashboard/contacts">
                <Button variant="outline" size="lg" className="font-bold">
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Contacts
                </Button>
              </Link>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary rounded-xl border-2 border-border shadow-[3px_3px_0_0_hsl(var(--border))]">
                  <Users className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-5xl font-black uppercase tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    Add New Contact
                  </h1>
                  <p className="text-muted-foreground font-semibold text-lg mt-1">
                    Expand your network • Build relationships
                  </p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="w-16 h-16 bg-yellow-400 rounded-2xl border-2 border-border shadow-[3px_3px_0_0_hsl(var(--border))] flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-yellow-800" />
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <Card className="group hover:shadow-[8px_8px_0_0_hsl(var(--border))] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-300 bg-gradient-to-br from-card to-card/80">
          <CardHeader className="pb-6">
            <CardTitle className="text-3xl font-black uppercase flex items-center gap-3">
              <div className="p-2 bg-primary rounded-xl border-2 border-border shadow-[2px_2px_0_0_hsl(var(--border))]">
                <User className="h-6 w-6 text-primary-foreground" />
              </div>
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-destructive/15 border-2 border-destructive text-destructive px-6 py-4 rounded-xl mb-8 font-bold shadow-[3px_3px_0_0_hsl(var(--destructive)/0.3)]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg border border-blue-200">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-black uppercase text-blue-800">
                    Basic Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="first_name"
                      className="text-base font-bold uppercase"
                    >
                      First Name
                    </Label>
                    <Input
                      {...register("first_name")}
                      id="first_name"
                      placeholder="Enter first name"
                      className="h-12 text-base font-medium border-2 shadow-[3px_3px_0_0_hsl(var(--border))] focus:shadow-[5px_5px_0_0_hsl(var(--border))] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all"
                    />
                    {errors.first_name && (
                      <p className="text-sm text-destructive font-bold">
                        {errors.first_name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="last_name"
                      className="text-base font-bold uppercase"
                    >
                      Last Name
                    </Label>
                    <Input
                      {...register("last_name")}
                      id="last_name"
                      placeholder="Enter last name"
                      className="h-12 text-base font-medium border-2 shadow-[3px_3px_0_0_hsl(var(--border))] focus:shadow-[5px_5px_0_0_hsl(var(--border))] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all"
                    />
                    {errors.last_name && (
                      <p className="text-sm text-destructive font-bold">
                        {errors.last_name.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="email"
                    className="text-base font-bold uppercase flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    {...register("email")}
                    type="email"
                    id="email"
                    placeholder="Enter email address"
                    className="h-12 text-base font-medium border-2 shadow-[3px_3px_0_0_hsl(var(--border))] focus:shadow-[5px_5px_0_0_hsl(var(--border))] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive font-bold">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="phone"
                    className="text-base font-bold uppercase flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    {...register("phone")}
                    id="phone"
                    placeholder="Enter phone number"
                    className="h-12 text-base font-medium border-2 shadow-[3px_3px_0_0_hsl(var(--border))] focus:shadow-[5px_5px_0_0_hsl(var(--border))] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all"
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive font-bold">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Professional Information Section */}
              <div className="space-y-6 pt-6 border-t-2 border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-lg border border-green-200">
                    <Building className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="text-xl font-black uppercase text-green-800">
                    Professional Details
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="company"
                      className="text-base font-bold uppercase"
                    >
                      Company
                    </Label>
                    <Input
                      {...register("company")}
                      id="company"
                      placeholder="Enter company name"
                      className="h-12 text-base font-medium border-2 shadow-[3px_3px_0_0_hsl(var(--border))] focus:shadow-[5px_5px_0_0_hsl(var(--border))] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="role_title"
                      className="text-base font-bold uppercase"
                    >
                      Job Title
                    </Label>
                    <Input
                      {...register("role_title")}
                      id="role_title"
                      placeholder="Enter job title"
                      className="h-12 text-base font-medium border-2 shadow-[3px_3px_0_0_hsl(var(--border))] focus:shadow-[5px_5px_0_0_hsl(var(--border))] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="source"
                    className="text-base font-bold uppercase"
                  >
                    Source
                  </Label>
                  <Input
                    {...register("source")}
                    id="source"
                    placeholder="How did you meet? (e.g., LinkedIn, conference, referral)"
                    className="h-12 text-base font-medium border-2 shadow-[3px_3px_0_0_hsl(var(--border))] focus:shadow-[5px_5px_0_0_hsl(var(--border))] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all"
                  />
                </div>
              </div>

              {/* Social Links Section */}
              <div className="space-y-6 pt-6 border-t-2 border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg border border-purple-200">
                    <Globe className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-black uppercase text-purple-800">
                    Social Links
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="linkedin_url"
                      className="text-base font-bold uppercase"
                    >
                      LinkedIn URL
                    </Label>
                    <Input
                      {...register("linkedin_url")}
                      id="linkedin_url"
                      placeholder="https://linkedin.com/in/..."
                      className="h-12 text-base font-medium border-2 shadow-[3px_3px_0_0_hsl(var(--border))] focus:shadow-[5px_5px_0_0_hsl(var(--border))] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all"
                    />
                    {errors.linkedin_url && (
                      <p className="text-sm text-destructive font-bold">
                        {errors.linkedin_url.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="twitter_url"
                      className="text-base font-bold uppercase"
                    >
                      Twitter URL
                    </Label>
                    <Input
                      {...register("twitter_url")}
                      id="twitter_url"
                      placeholder="https://twitter.com/..."
                      className="h-12 text-base font-medium border-2 shadow-[3px_3px_0_0_hsl(var(--border))] focus:shadow-[5px_5px_0_0_hsl(var(--border))] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all"
                    />
                    {errors.twitter_url && (
                      <p className="text-sm text-destructive font-bold">
                        {errors.twitter_url.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="website"
                      className="text-base font-bold uppercase"
                    >
                      Website
                    </Label>
                    <Input
                      {...register("website")}
                      id="website"
                      placeholder="https://example.com"
                      className="h-12 text-base font-medium border-2 shadow-[3px_3px_0_0_hsl(var(--border))] focus:shadow-[5px_5px_0_0_hsl(var(--border))] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all"
                    />
                    {errors.website && (
                      <p className="text-sm text-destructive font-bold">
                        {errors.website.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information Section */}
              <div className="space-y-6 pt-6 border-t-2 border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 rounded-lg border border-orange-200">
                    <MapPin className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-black uppercase text-orange-800">
                    Additional Information
                  </h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="address"
                      className="text-base font-bold uppercase flex items-center gap-2"
                    >
                      <MapPin className="h-4 w-4" />
                      Address
                    </Label>
                    <Input
                      {...register("address")}
                      id="address"
                      placeholder="Enter full address"
                      className="h-12 text-base font-medium border-2 shadow-[3px_3px_0_0_hsl(var(--border))] focus:shadow-[5px_5px_0_0_hsl(var(--border))] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="birthday"
                      className="text-base font-bold uppercase flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Birthday
                    </Label>
                    <Input
                      {...register("birthday")}
                      type="date"
                      id="birthday"
                      className="h-12 text-base font-medium border-2 shadow-[3px_3px_0_0_hsl(var(--border))] focus:shadow-[5px_5px_0_0_hsl(var(--border))] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="notes"
                      className="text-base font-bold uppercase"
                    >
                      Notes
                    </Label>
                    <textarea
                      {...register("notes")}
                      id="notes"
                      placeholder="Add any additional notes about this contact..."
                      className="flex min-h-[120px] w-full rounded-lg border-2 border-border bg-background px-4 py-3 text-base font-medium ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 shadow-[3px_3px_0_0_hsl(var(--border))] focus:shadow-[5px_5px_0_0_hsl(var(--border))] focus:translate-x-[-1px] focus:translate-y-[-1px] transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-8 border-t-2 border-border">
                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="font-bold text-lg px-8 py-4 h-14"
                >
                  {isLoading ? "Creating Contact..." : "Create Contact"}
                </Button>
                <Link href="/dashboard/contacts">
                  <Button
                    variant="outline"
                    size="lg"
                    className="font-bold px-8 py-4 h-14"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
