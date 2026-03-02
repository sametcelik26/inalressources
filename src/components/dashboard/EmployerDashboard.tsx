import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Briefcase, Users, MessageSquare, Edit, Trash2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type JobPosting = Database["public"]["Tables"]["job_postings"]["Row"];
type Application = Database["public"]["Tables"]["job_applications"]["Row"] & { profile?: Database["public"]["Tables"]["profiles"]["Row"] };

const EmployerDashboard = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", location: "", salary_min: "", salary_max: "", job_type: "full_time" as string, category: "", experience_level: "entry" as string, skills: "", deadline: "" });

  useEffect(() => {
    if (user) fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    if (!user) return;
    const { data } = await supabase.from("job_postings").select("*").eq("employer_id", user.id).order("created_at", { ascending: false });
    setJobs(data || []);
  };

  const fetchApplications = async (jobId: string) => {
    setSelectedJob(jobId);
    const { data } = await supabase.from("job_applications").select("*").eq("job_id", jobId).order("created_at", { ascending: false });
    if (data) {
      const seekerIds = data.map((a) => a.seeker_id);
      const { data: profiles } = await supabase.from("profiles").select("*").in("user_id", seekerIds);
      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));
      setApplications(data.map((a) => ({ ...a, profile: profileMap.get(a.seeker_id) })));
    }
  };

  const createJob = async () => {
    if (!user) return;
    const { error } = await supabase.from("job_postings").insert({
      employer_id: user.id,
      title: form.title,
      description: form.description,
      location: form.location,
      salary_min: form.salary_min ? Number(form.salary_min) : null,
      salary_max: form.salary_max ? Number(form.salary_max) : null,
      job_type: form.job_type as any,
      category: form.category || null,
      experience_level: form.experience_level as any,
      skills: form.skills ? form.skills.split(",").map((s) => s.trim()) : null,
      deadline: form.deadline || null,
    });
    if (error) {
      toast({ title: t("auth.error"), description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("dashboard.jobCreated") });
      setShowCreateDialog(false);
      setForm({ title: "", description: "", location: "", salary_min: "", salary_max: "", job_type: "full_time", category: "", experience_level: "entry", skills: "", deadline: "" });
      fetchJobs();
    }
  };

  const deleteJob = async (id: string) => {
    await supabase.from("job_postings").delete().eq("id", id);
    fetchJobs();
    toast({ title: t("dashboard.jobDeleted") });
  };

  const updateAppStatus = async (appId: string, status: string) => {
    await supabase.from("job_applications").update({ status: status as any }).eq("id", appId);
    if (selectedJob) fetchApplications(selectedJob);
    toast({ title: t("dashboard.statusUpdated") });
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    reviewed: "bg-blue-100 text-blue-800",
    shortlisted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    hired: "bg-emerald-100 text-emerald-800",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-foreground">{t("dashboard.employerTitle")}</h1>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-accent hover:bg-orange-hover text-accent-foreground font-heading font-bold">
              <Plus className="w-4 h-4 mr-2" /> {t("dashboard.postJob")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-heading">{t("dashboard.createJob")}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder={t("dashboard.jobTitle")} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={200} />
              <Textarea placeholder={t("dashboard.jobDescription")} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} required maxLength={5000} />
              <Input placeholder={t("dashboard.location")} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required maxLength={100} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder={t("dashboard.salaryMin")} type="number" value={form.salary_min} onChange={(e) => setForm({ ...form, salary_min: e.target.value })} />
                <Input placeholder={t("dashboard.salaryMax")} type="number" value={form.salary_max} onChange={(e) => setForm({ ...form, salary_max: e.target.value })} />
              </div>
              <Select value={form.job_type} onValueChange={(v) => setForm({ ...form, job_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">{language === "fr" ? "Temps plein" : "Full Time"}</SelectItem>
                  <SelectItem value="part_time">{language === "fr" ? "Temps partiel" : "Part Time"}</SelectItem>
                  <SelectItem value="contract">{language === "fr" ? "Contrat" : "Contract"}</SelectItem>
                  <SelectItem value="temporary">{language === "fr" ? "Temporaire" : "Temporary"}</SelectItem>
                  <SelectItem value="internship">{language === "fr" ? "Stage" : "Internship"}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.experience_level} onValueChange={(v) => setForm({ ...form, experience_level: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">{language === "fr" ? "Débutant" : "Entry Level"}</SelectItem>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="mid">{language === "fr" ? "Intermédiaire" : "Mid Level"}</SelectItem>
                  <SelectItem value="senior">{language === "fr" ? "Sénior" : "Senior"}</SelectItem>
                  <SelectItem value="executive">{language === "fr" ? "Exécutif" : "Executive"}</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder={t("dashboard.category")} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} maxLength={100} />
              <Input placeholder={t("dashboard.skillsComma")} value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} maxLength={500} />
              <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              <Button onClick={createJob} className="w-full rounded-full bg-accent hover:bg-orange-hover text-accent-foreground font-heading font-bold">
                {t("dashboard.publishJob")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Briefcase className="w-8 h-8 text-accent mx-auto mb-2" />
          <div className="text-2xl font-heading font-bold text-foreground">{jobs.length}</div>
          <div className="text-xs text-muted-foreground">{t("dashboard.activeJobs")}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <Users className="w-8 h-8 text-accent mx-auto mb-2" />
          <div className="text-2xl font-heading font-bold text-foreground">{applications.length}</div>
          <div className="text-xs text-muted-foreground">{t("dashboard.totalApplications")}</div>
        </div>
        <Link to="/messages" className="bg-card border border-border rounded-xl p-4 text-center hover:shadow-md transition-shadow">
          <MessageSquare className="w-8 h-8 text-accent mx-auto mb-2" />
          <div className="text-xs text-muted-foreground">{t("dashboard.messages")}</div>
        </Link>
      </div>

      <Tabs defaultValue="jobs">
        <TabsList>
          <TabsTrigger value="jobs">{t("dashboard.myJobs")}</TabsTrigger>
          <TabsTrigger value="applications">{t("dashboard.applications")}</TabsTrigger>
        </TabsList>
        <TabsContent value="jobs">
          {jobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t("dashboard.noJobs")}</div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                  <div className="cursor-pointer flex-1" onClick={() => fetchApplications(job.id)}>
                    <h3 className="font-heading font-semibold text-foreground">{job.title}</h3>
                    <p className="text-xs text-muted-foreground">{job.location} · {new Date(job.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${job.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {job.is_active ? t("dashboard.active") : t("dashboard.inactive")}
                    </span>
                    <button onClick={() => deleteJob(job.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="applications">
          {!selectedJob ? (
            <div className="text-center py-8 text-muted-foreground">{t("dashboard.selectJobFirst")}</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t("dashboard.noApplicationsYet")}</div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div key={app.id} className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-heading font-semibold text-foreground">{app.profile?.full_name || t("dashboard.anonymous")}</h4>
                      <p className="text-xs text-muted-foreground">{new Date(app.created_at).toLocaleDateString()}</p>
                    </div>
                    <Select value={app.status} onValueChange={(v) => updateAppStatus(app.id, v)}>
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="shortlisted">Shortlisted</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {app.cover_letter && <p className="text-sm text-muted-foreground mt-2 bg-secondary p-3 rounded-lg">{app.cover_letter}</p>}
                  <Link to={`/messages?to=${app.seeker_id}`} className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-2">
                    <MessageSquare className="w-3 h-3" /> {t("dashboard.sendMessage")}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmployerDashboard;
