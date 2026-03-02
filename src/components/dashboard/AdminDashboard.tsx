import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Briefcase, FileText, Shield } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type JobPosting = Database["public"]["Tables"]["job_postings"]["Row"];

const AdminDashboard = () => {
  const { t } = useLanguage();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [stats, setStats] = useState({ users: 0, jobs: 0, applications: 0 });

  useEffect(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setProfiles(data || []);
      setStats((s) => ({ ...s, users: data?.length || 0 }));
    });
    supabase.from("job_postings").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setJobs(data || []);
      setStats((s) => ({ ...s, jobs: data?.length || 0 }));
    });
    supabase.from("job_applications").select("id", { count: "exact", head: true }).then(({ count }) => {
      setStats((s) => ({ ...s, applications: count || 0 }));
    });
  }, []);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Shield className="w-6 h-6 text-accent" />
        <h1 className="text-2xl font-heading font-bold text-foreground">{t("dashboard.adminTitle")}</h1>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Users className="w-8 h-8 text-accent mx-auto mb-2" />
          <div className="text-2xl font-heading font-bold text-foreground">{stats.users}</div>
          <div className="text-xs text-muted-foreground">{t("dashboard.totalUsers")}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Briefcase className="w-8 h-8 text-accent mx-auto mb-2" />
          <div className="text-2xl font-heading font-bold text-foreground">{stats.jobs}</div>
          <div className="text-xs text-muted-foreground">{t("dashboard.totalJobs")}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <FileText className="w-8 h-8 text-accent mx-auto mb-2" />
          <div className="text-2xl font-heading font-bold text-foreground">{stats.applications}</div>
          <div className="text-xs text-muted-foreground">{t("dashboard.totalApplications")}</div>
        </div>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">{t("dashboard.users")}</TabsTrigger>
          <TabsTrigger value="jobs">{t("dashboard.jobs")}</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <div className="space-y-2">
            {profiles.map((p) => (
              <div key={p.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
                <div>
                  <span className="font-heading font-semibold text-foreground">{p.full_name || "—"}</span>
                  <span className="text-xs text-muted-foreground ml-2">{p.company_name ? `(${p.company_name})` : ""}</span>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="jobs">
          <div className="space-y-2">
            {jobs.map((j) => (
              <div key={j.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
                <div>
                  <span className="font-heading font-semibold text-foreground">{j.title}</span>
                  <span className="text-xs text-muted-foreground ml-2">{j.location}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${j.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {j.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
