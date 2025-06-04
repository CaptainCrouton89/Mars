"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Contact, Opportunity, OPPORTUNITY_STAGES } from "@/types/database";
import {
  Briefcase,
  Calendar,
  DollarSign,
  Grid3X3,
  List,
  Plus,
  Search,
  Star,
  Target,
  User,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchOpportunities();
    }
  }, [user]);

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from("opportunities")
        .select(
          `
          *,
          contact:contacts(*)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOpportunities(data || []);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOpportunities = opportunities.filter((opportunity) => {
    const matchesSearch =
      searchTerm === "" ||
      opportunity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opportunity.contact?.first_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      opportunity.contact?.last_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      opportunity.contact?.company
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStage =
      stageFilter === "all" || opportunity.stage === stageFilter;

    return matchesSearch && matchesStage;
  });

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Lead":
        return "bg-gray-100 text-gray-700";
      case "Contacted":
        return "bg-blue-100 text-blue-700";
      case "Proposal":
        return "bg-amber-100 text-amber-700";
      case "Negotiation":
        return "bg-orange-100 text-orange-700";
      case "Won":
        return "bg-green-100 text-green-700";
      case "Lost":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };


  const formatCurrency = (value: number | null, currency: string | null) => {
    if (!value) return null;
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    return formatter.format(value);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getContactDisplayName = (contact: Contact | null) => {
    if (!contact) return "Unknown Contact";
    const name = [contact.first_name, contact.last_name]
      .filter(Boolean)
      .join(" ");
    return name || contact.email || "Unnamed Contact";
  };

  const getTotalValue = () => {
    return filteredOpportunities.reduce(
      (sum, opp) => sum + (opp.value || 0),
      0
    );
  };

  const getWonOpportunities = () => {
    return filteredOpportunities.filter((opp) => opp.stage === "Won");
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
              Opportunities
            </h1>
            <p className="text-muted-foreground">
              {filteredOpportunities.length} {filteredOpportunities.length === 1 ? "opportunity" : "opportunities"} in your pipeline
            </p>
          </div>
          <Link href="/dashboard/opportunities/new">
            <Button size="lg" className="shadow-sm hover:shadow-md transition-shadow">
              <Plus className="h-4 w-4 mr-2" />
              Add Opportunity
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Pipeline Value
                  </p>
                  <p className="text-2xl font-semibold mt-1">
                    {formatCurrency(getTotalValue(), "USD") || "$0"}
                  </p>
                </div>
                <div className="p-2 bg-muted rounded-full">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Won Deals
                  </p>
                  <p className="text-2xl font-semibold mt-1">
                    {getWonOpportunities().length}
                  </p>
                </div>
                <div className="p-2 bg-muted rounded-full">
                  <Target className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Active Opportunities
                  </p>
                  <p className="text-2xl font-semibold mt-1">
                    {
                      filteredOpportunities.filter(
                        (opp) => !["Won", "Lost"].includes(opp.stage)
                      ).length
                    }
                  </p>
                </div>
                <div className="p-2 bg-muted rounded-full">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search opportunities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="h-10 px-3 py-2 border border-input rounded-md bg-background text-sm"
            >
              <option value="all">All Stages</option>
              {OPPORTUNITY_STAGES.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
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
        {filteredOpportunities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              {searchTerm || stageFilter !== "all"
                ? "No matches found"
                : "No opportunities yet"}
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm text-center mb-6">
              {searchTerm || stageFilter !== "all"
                ? "Try adjusting your search or filter"
                : "Start tracking your sales pipeline"}
            </p>
            {!searchTerm && stageFilter === "all" && (
              <Link href="/dashboard/opportunities/new">
                <Button className="shadow-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Opportunity
                </Button>
              </Link>
            )}
          </div>
        ) : (
          /* Opportunities Grid/List */
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-3"
            }
          >
            {filteredOpportunities.map((opportunity) => (
              <Link
                key={opportunity.id}
                href={`/dashboard/opportunities/${opportunity.id}`}
              >
                <Card
                  className={`group hover:shadow-md transition-all duration-200 cursor-pointer border-border/50 hover:border-border ${
                    viewMode === "list"
                      ? "flex flex-row"
                      : "h-full flex flex-col"
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
                      className={`flex items-start justify-between ${
                        viewMode === "list" ? "flex-1" : "w-full"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <CardTitle
                          className={`${
                            viewMode === "list" ? "text-base" : "text-sm"
                          } font-medium truncate mb-1`}
                        >
                          {opportunity.name}
                        </CardTitle>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <User className="h-3 w-3 mr-1.5" />
                          <span className="truncate">
                            {getContactDisplayName(opportunity.contact || null)}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-2 ${
                          viewMode === "list" ? "ml-4" : "mt-2"
                        }`}
                      >
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStageColor(
                            opportunity.stage
                          )}`}
                        >
                          {opportunity.stage}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent
                    className={`${
                      viewMode === "list"
                        ? "flex-1 p-4 py-0 flex items-center"
                        : "p-4 pt-0 flex-grow flex flex-col justify-between"
                    }`}
                  >
                    <div
                      className={`${
                        viewMode === "list"
                          ? "flex items-center gap-6 flex-1"
                          : "space-y-2"
                      }`}
                    >
                      {opportunity.value && (
                        <div className="flex items-center text-sm font-medium text-foreground">
                          <DollarSign className="h-3 w-3 mr-1.5 text-muted-foreground" />
                          <span>
                            {formatCurrency(
                              opportunity.value,
                              opportunity.currency || null
                            )}
                          </span>
                        </div>
                      )}

                      {opportunity.expected_close_date && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1.5" />
                          <span>
                            {formatDate(opportunity.expected_close_date)}
                          </span>
                        </div>
                      )}

                      {opportunity.priority && viewMode === "grid" && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Star className="h-3 w-3 mr-1.5" />
                          <span>Priority {opportunity.priority}</span>
                        </div>
                      )}
                    </div>

                    {opportunity.description && viewMode === "grid" && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                        {opportunity.description}
                      </p>
                    )}

                    {/* Tags */}
                    {viewMode === "grid" && (
                      <div className="flex gap-1.5 mt-3">
                        {opportunity.priority && opportunity.priority >= 4 && (
                          <div className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                            High Priority
                          </div>
                        )}
                        {opportunity.value && opportunity.value >= 10000 && (
                          <div className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded">
                            High Value
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
