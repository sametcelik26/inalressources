import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Clock, DollarSign, Briefcase, Filter, X, AlertCircle, ChevronRight, Calendar, ArrowUpDown } from "lucide-react";
import Layout from "@/components/Layout";
import { jobTypeLabels, experienceLabels } from "@/lib/constants";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Database } from "@/integrations/supabase/types";
import JobApplicationOverlay from "@/components/JobApplicationOverlay";

type JobPosting = Database["public"]["Tables"]["job_postings"]["Row"];

const SkeletonCard = () => (
  <div className="bg-card border border-border rounded-xl p-5 animate-pulse">
    <div className="h-5 bg-muted rounded w-2/3 mb-3" />
    <div className="flex gap-3 mb-3">
      <div className="h-4 bg-muted rounded w-24" />
      <div className="h-4 bg-muted rounded w-20" />
    </div>
    <div className="h-4 bg-muted rounded w-full mb-1" />
    <div className="h-4 bg-muted rounded w-4/5" />
  </div>
);

const formatSalary = (min: number | null, max: number | null) => {
  if (!min && !max) return null;
  if (min && max) return `$${min}/h - $${max}/h`;
  if (min) return `$${min}/h+`;
  return `Up to $${max}/h`;
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
};

const jobTypeBadgeVariant = (type: string) => {
  switch (type) {
    case "full_time": return "default";
    case "part_time": return "secondary";
    case "contract": return "outline";
    case "temporary": return "destructive";
    default: return "secondary";
  }
};

const Jobs = () => {
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [expFilter, setExpFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [sortBy, setSortBy] = useState<"date" | "salary">("date");
  const [applyJobId, setApplyJobId] = useState<string | null>(null);
  const [applyJobTitle, setApplyJobTitle] = useState("");

  const hasActiveFilters = search || locationFilter || typeFilter !== "all" || expFilter !== "all";

  const clearFilters = useCallback(() => {
    setSearch("");
    setLocationFilter("");
    setTypeFilter("all");
    setExpFilter("all");
  }, []);

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
    staleTime: 1000 * 60 * 2,
  });

  const filtered = jobs
    .filter((j) => {
      const q = search.toLowerCase();
      const matchSearch = !search || j.title.toLowerCase().includes(q) || j.description.toLowerCase().includes(q);
      const matchLoc = !locationFilter || j.location.toLowerCase().includes(locationFilter.toLowerCase());
      return matchSearch && matchLoc;
    })
    .sort((a, b) => {
      if (sortBy === "salary") return (b.salary_max ?? 0) - (a.salary_max ?? 0);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // Auto-select first job on desktop
  const activeJob = selectedJob || (filtered.length > 0 && !isMobile ? filtered[0] : null);

  return (
    <Layout>
      {/* Search Header */}
      <div className="bg-navy py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-primary-foreground mb-5">{t("jobs.title")}</h1>
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
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8">
              <Search className="w-4 h-4 mr-2" /> {t("jobs.search")}
            </Button>
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Button
              variant={showFilters ? "default" : "outline"}
              size="sm"
              className={showFilters ? "bg-accent text-accent-foreground" : "bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20"}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-3.5 h-3.5 mr-1.5" /> {t("jobs.filters")}
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground/70 hover:text-primary-foreground"
                onClick={clearFilters}
              >
                <X className="w-3.5 h-3.5 mr-1" /> {t("jobs.clearFilters")}
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

      {/* Results Area */}
      <div className="bg-muted/30 min-h-[60vh]">
        <div className="container mx-auto px-4 py-4">
          {isError ? (
            <div className="flex flex-col items-center justify-center py-16 text-destructive gap-3">
              <AlertCircle className="w-10 h-10" />
              <p className="font-heading font-semibold text-lg">{t("jobs.errorTitle")}</p>
              <p className="text-muted-foreground text-sm">{t("jobs.errorDesc")}</p>
            </div>
          ) : isLoading ? (
            <div className="grid gap-3 max-w-xl">
              {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <>
              {/* Results bar */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground font-body">
                  <span className="font-semibold text-foreground">{filtered.length}</span> {t("jobs.results")}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm text-muted-foreground"
                  onClick={() => setSortBy(sortBy === "date" ? "salary" : "date")}
                >
                  <ArrowUpDown className="w-3.5 h-3.5 mr-1.5" />
                  {sortBy === "date" ? t("jobs.sortByDate") : t("jobs.sortBySalary")}
                </Button>
              </div>

              {filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">{t("jobs.noResults")}</div>
              ) : (
                <div className="flex gap-5">
                  {/* Left panel — Job list */}
                  <div className={`flex flex-col gap-3 overflow-y-auto ${isMobile ? "w-full" : "w-[420px] shrink-0 max-h-[70vh] pr-1"}`}
                    style={!isMobile ? { scrollbarWidth: "thin" } : undefined}
                  >
                    {filtered.map((job) => {
                      const isSelected = activeJob?.id === job.id;
                      const salary = formatSalary(job.salary_min, job.salary_max);
                      return (
                        <div
                          key={job.id}
                          className={`bg-card border rounded-xl p-5 cursor-pointer transition-all hover:shadow-md ${
                            isSelected && !isMobile
                              ? "border-accent shadow-md ring-1 ring-accent/30"
                              : "border-border hover:border-accent/40"
                          }`}
                          onClick={() => {
                            setSelectedJob(job);
                            if (isMobile) {
                              window.location.href = `/jobs/${job.id}`;
                            }
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base font-heading font-bold text-foreground leading-tight">{job.title}</h3>
                            {!isMobile && <ChevronRight className={`w-4 h-4 shrink-0 mt-1 transition-colors ${isSelected ? "text-accent" : "text-muted-foreground/40"}`} />}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge variant={jobTypeBadgeVariant(job.job_type) as any} className="text-xs">
                              {jobTypeLabels[job.job_type]?.[language]}
                            </Badge>
                            {job.experience_level && (
                              <Badge variant="outline" className="text-xs">
                                {experienceLabels[job.experience_level]?.[language]}
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                            {salary && <span className="flex items-center gap-1 text-accent font-semibold"><DollarSign className="w-3 h-3" />{salary}</span>}
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{timeAgo(job.created_at)}</span>
                          </div>

                          <p className="text-xs text-muted-foreground mt-2.5 line-clamp-2 leading-relaxed">{job.description}</p>

                          {job.skills && job.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2.5">
                              {job.skills.slice(0, 3).map((s) => (
                                <span key={s} className="bg-secondary text-secondary-foreground text-[10px] px-2 py-0.5 rounded-full">{s}</span>
                              ))}
                              {job.skills.length > 3 && (
                                <span className="text-[10px] text-muted-foreground px-1">+{job.skills.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Right panel — Job detail preview (desktop only) */}
                  {!isMobile && activeJob && (
                    <div className="flex-1 bg-card border border-border rounded-xl p-8 max-h-[70vh] overflow-y-auto sticky top-4" style={{ scrollbarWidth: "thin" }}>
                      <div className="mb-6">
                        <h2 className="text-2xl font-heading font-bold text-foreground mb-2">{activeJob.title}</h2>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{activeJob.location}</span>
                          <Badge variant={jobTypeBadgeVariant(activeJob.job_type) as any}>
                            {jobTypeLabels[activeJob.job_type]?.[language]}
                          </Badge>
                          {activeJob.experience_level && (
                            <Badge variant="outline">
                              {experienceLabels[activeJob.experience_level]?.[language]}
                            </Badge>
                          )}
                          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{timeAgo(activeJob.created_at)}</span>
                        </div>
                      </div>

                      {/* Salary */}
                      {(activeJob.salary_min || activeJob.salary_max) && (
                        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
                          <div className="flex items-center gap-2 text-accent font-heading font-bold text-lg">
                            <DollarSign className="w-5 h-5" />
                            {formatSalary(activeJob.salary_min, activeJob.salary_max)}
                          </div>
                        </div>
                      )}

                      {/* Apply button */}
                      <Button
                        className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-base py-5 mb-6"
                        onClick={() => { setApplyJobId(activeJob.id); setApplyJobTitle(activeJob.title); }}
                      >
                        {t("jobs.applyNow")}
                      </Button>

                      {/* Description */}
                      <div className="mb-6">
                        <h3 className="font-heading font-bold text-foreground mb-3">{t("jobs.description")}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{activeJob.description}</p>
                      </div>

                      {/* Responsibilities */}
                      {(activeJob as any).responsibilities && (
                        <div className="mb-6">
                          <h3 className="font-heading font-bold text-foreground mb-3">{t("jobs.responsibilities")}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{(activeJob as any).responsibilities}</p>
                        </div>
                      )}

                      {/* Skills Required */}
                      {(activeJob as any).skills_required && (
                        <div className="mb-6">
                          <h3 className="font-heading font-bold text-foreground mb-3">{t("jobs.skillsRequired")}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{(activeJob as any).skills_required}</p>
                        </div>
                      )}

                      {/* Conditions */}
                      {(activeJob as any).conditions && (
                        <div className="mb-6">
                          <h3 className="font-heading font-bold text-foreground mb-3">{t("jobs.conditions")}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{(activeJob as any).conditions}</p>
                        </div>
                      )}

                      {/* Benefits */}
                      {(activeJob as any).benefits && (
                        <div className="mb-6">
                          <h3 className="font-heading font-bold text-foreground mb-3">{t("jobs.benefits")}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{(activeJob as any).benefits}</p>
                        </div>
                      )}

                      {/* Skills Tags */}
                      {activeJob.skills && activeJob.skills.length > 0 && (
                        <div>
                          <h3 className="font-heading font-bold text-foreground mb-3">{t("jobs.requiredSkills")}</h3>
                          <div className="flex flex-wrap gap-2">
                            {activeJob.skills.map((s) => (
                              <Badge key={s} variant="secondary" className="text-sm px-3 py-1">
                                {s}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Application Overlay */}
      <JobApplicationOverlay
        isOpen={!!applyJobId}
        onClose={() => setApplyJobId(null)}
        jobId={applyJobId || ""}
        jobTitle={applyJobTitle}
      />
    </Layout>
  );
};

export default Jobs;