import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Briefcase, Heart, FileText, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Database } from "@/integrations/supabase/types";

type Application = Database["public"]["Tables"]["job_applications"]["Row"];
type JobPosting = Database["public"]["Tables"]["job_postings"]["Row"];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewed: "bg-blue-100 text-blue-800",
  shortlisted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  hired: "bg-emerald-100 text-emerald-800",
};

const SeekerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [applications, setApplications] = useState<(Application & { job?: JobPosting })[]>([]);
  const [savedJobs, setSavedJobs] = useState<JobPosting[]>([]);

  useEffect(() => {
    if (!user) return;
    // Fetch applications
    supabase.from("job_applications").select("*").eq("seeker_id", user.id).order("created_at", { ascending: false })
      .then(async ({ data }) => {
        if (!data) return;
        const jobIds = data.map((a) => a.job_id);
        const { data: jobs } = await supabase.from("job_postings").select("*").in("id", jobIds);
        const jobMap = new Map(jobs?.map((j) => [j.id, j]));
        setApplications(data.map((a) => ({ ...a, job: jobMap.get(a.job_id) })));
      });
    // Fetch saved jobs
    supabase.from("saved_jobs").select("job_id").eq("user_id", user.id).then(async ({ data }) => {
      if (!data || data.length === 0) return;
      const { data: jobs } = await supabase.from("job_postings").select("*").in("id", data.map((s) => s.job_id));
      setSavedJobs(jobs || []);
    });
  }, [user]);

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold text-foreground mb-6">{t("dashboard.seekerTitle")}</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <FileText className="w-8 h-8 text-accent mx-auto mb-2" />
          <div className="text-2xl font-heading font-bold text-foreground">{applications.length}</div>
          <div className="text-xs text-muted-foreground">{t("dashboard.applications")}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Heart className="w-8 h-8 text-accent mx-auto mb-2" />
          <div className="text-2xl font-heading font-bold text-foreground">{savedJobs.length}</div>
          <div className="text-xs text-muted-foreground">{t("dashboard.savedJobs")}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Briefcase className="w-8 h-8 text-accent mx-auto mb-2" />
          <div className="text-2xl font-heading font-bold text-foreground">{applications.filter((a) => a.status === "shortlisted").length}</div>
          <div className="text-xs text-muted-foreground">{t("dashboard.shortlisted")}</div>
        </div>
        <Link to="/messages" className="bg-card border border-border rounded-xl p-4 text-center hover:shadow-md transition-shadow">
          <MessageSquare className="w-8 h-8 text-accent mx-auto mb-2" />
          <div className="text-xs text-muted-foreground">{t("dashboard.messages")}</div>
        </Link>
      </div>

      <Tabs defaultValue="applications">
        <TabsList>
          <TabsTrigger value="applications">{t("dashboard.myApplications")}</TabsTrigger>
          <TabsTrigger value="saved">{t("dashboard.savedJobs")}</TabsTrigger>
        </TabsList>
        <TabsContent value="applications">
          {applications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("dashboard.noApplications")} <Link to="/jobs" className="text-accent hover:underline">{t("dashboard.browseJobs")}</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <Link to={`/jobs/${app.job_id}`} className="font-heading font-semibold text-foreground hover:text-accent">{app.job?.title || app.job_id}</Link>
                    <p className="text-xs text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-semibold ${statusColors[app.status] || ""}`}>{app.status}</span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="saved">
          {savedJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t("dashboard.noSaved")}</div>
          ) : (
            <div className="space-y-3">
              {savedJobs.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`} className="block bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-heading font-semibold text-foreground">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{job.location}</p>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SeekerDashboard;
