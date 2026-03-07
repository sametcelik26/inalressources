import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Clock, DollarSign, Briefcase, Filter, X, AlertCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { jobTypeLabels, experienceLabels } from "@/lib/constants";
import type { Database } from "@/integrations/supabase/types";

type JobPosting = Database["public"]["Tables"]["job_postings"]["Row"];

const SkeletonCard = () => (
  <div className="bg-card border border-border rounded-xl p-6 animate-pulse">
    <div className="h-5 bg-muted rounded w-2/3 mb-3" />
    <div className="flex gap-3 mb-3">
      <div className="h-4 bg-muted rounded w-24" />
      <div className="h-4 bg-muted rounded w-20" />
      <div className="h-4 bg-muted rounded w-16" />
    </div>
    <div className="h-4 bg-muted rounded w-full mb-1" />
    <div className="h-4 bg-muted rounded w-4/5" />
  </div>
);

const Jobs = () => {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [expFilter, setExpFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = search || locationFilter || typeFilter !== "all" || expFilter !== "all";

  const clearFilters = useCallback(() => {
    setSearch("");
    setLocationFilter("");
    setTypeFilter("all");
    setExpFilter("all");
  }, []);

  // Server-side query: filter by type and experience level at DB level.
  // Title/location are filtered client-side since Supabase ilike requires exact column names.
  const { data: jobs = [], isLoading, isError } = useQuery<JobPosting[]>({
    queryKey: ["jobs", typeFilter, expFilter],
    queryFn: async () => {
      let query = supabase
        .from("job_postings")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (typeFilter !== "all") query = query.eq("job_type", typeFilter as any);
      if (expFilter !== "all") query = query.eq("experience_level", expFilter as any);

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 1000 * 60 * 2, // 2 min cache
  });

  // Client-side: text search on title, description, location
  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase();
    const matchSearch = !search || j.title.toLowerCase().includes(q) || j.description.toLowerCase().includes(q);
    const matchLoc = !locationFilter || j.location.toLowerCase().includes(locationFilter.toLowerCase());
    return matchSearch && matchLoc;
  });

  return (
    <Layout>
      <div className="bg-primary py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-heading font-bold text-primary-foreground mb-6">{t("jobs.title")}</h1>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("jobs.searchPlaceholder")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t("jobs.locationPlaceholder")}
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10 bg-background"
              />
            </div>
            <Button variant="outline" className="bg-background" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-2" /> {t("jobs.filters")}
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" className="text-primary-foreground/80 hover:text-primary-foreground" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" /> {t("jobs.clearFilters")}
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="flex flex-col sm:flex-row gap-3 mt-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-background w-full sm:w-48">
                  <SelectValue placeholder={t("jobs.jobType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("jobs.allTypes")}</SelectItem>
                  {Object.entries(jobTypeLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v[language]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={expFilter} onValueChange={setExpFilter}>
                <SelectTrigger className="bg-background w-full sm:w-48">
                  <SelectValue placeholder={t("jobs.experience")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("jobs.allLevels")}</SelectItem>
                  {Object.entries(experienceLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v[language]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {isError ? (
          <div className="flex flex-col items-center justify-center py-16 text-destructive gap-3">
            <AlertCircle className="w-10 h-10" />
            <p className="font-heading font-semibold text-lg">{t("jobs.errorTitle")}</p>
            <p className="text-muted-foreground text-sm">{t("jobs.errorDesc")}</p>
          </div>
        ) : isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-4">{filtered.length} {t("jobs.results")}</p>
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">{t("jobs.noResults")}</div>
            ) : (
              <div className="grid gap-4">
                {filtered.map((job) => (
                  <Link key={job.id} to={`/jobs/${job.id}`} className="block bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <h3 className="text-lg font-heading font-bold text-foreground mb-1">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                        <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{jobTypeLabels[job.job_type]?.[language]}</span>
                        {job.experience_level && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{experienceLabels[job.experience_level]?.[language]}</span>}
                        {(job.salary_min || job.salary_max) && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />
                            {job.salary_min && `$${job.salary_min.toLocaleString()}`}
                            {job.salary_min && job.salary_max && " - "}
                            {job.salary_max && `$${job.salary_max.toLocaleString()}`}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {job.skills.slice(0, 5).map((s) => (
                            <span key={s} className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Jobs;
