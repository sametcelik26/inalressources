import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Edit, Trash2, Eye, LogOut, Briefcase, MapPin, DollarSign,
  Calendar, Save, X, Search, LayoutDashboard, FileText, Users, Mail
} from "lucide-react";
import Layout from "@/components/Layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Database } from "@/integrations/supabase/types";

type JobPosting = Database["public"]["Tables"]["job_postings"]["Row"] & {
  company_name?: string | null;
  requirements?: string | null;
  application_email?: string | null;
};

type JobInsert = Database["public"]["Tables"]["job_postings"]["Insert"] & {
  company_name?: string | null;
  requirements?: string | null;
  application_email?: string | null;
};

const emptyJob = {
  title: "",
  company_name: "",
  location: "",
  job_type: "full_time" as Database["public"]["Enums"]["job_type"],
  salary_min: null as number | null,
  salary_max: null as number | null,
  description: "",
  requirements: "",
  application_email: "",
  deadline: "",
  category: "",
  experience_level: "entry" as Database["public"]["Enums"]["experience_level"],
  skills: [] as string[],
  is_active: true,
};

const AdminDashboard = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [view, setView] = useState<"list" | "form" | "submissions">("list");
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [form, setForm] = useState(emptyJob);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredSubmissions = submissions.filter(
    (sub: any) => statusFilter === "all" || (sub.status || "new") === statusFilter
  );

  const updateSubmissionStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("job_submissions")
      .update({ status } as any)
      .eq("id", id);
    if (!error) {
      setSubmissions((prev: any[]) => prev.map((s) => s.id === id ? { ...s, status } : s));
      toast({ title: "Status updated", description: `Application marked as ${status}.` });
    }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    const { error } = await supabase.from("job_submissions").delete().eq("id", id);
    if (!error) {
      setSubmissions((prev: any[]) => prev.filter((s) => s.id !== id));
      toast({ title: "Deleted", description: "Application removed." });
    }
  };

  // Auth check
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (roleData?.role !== "admin") {
        await supabase.auth.signOut();
        navigate("/admin");
        return;
      }

      setUserId(session.user.id);
      setLoading(false);
    };
    checkAdmin();
  }, [navigate]);

  // Fetch jobs
  useEffect(() => {
    if (!userId) return;
    fetchJobs();
    fetchSubmissions();
  }, [userId]);

  const fetchJobs = async () => {
    const { data } = await supabase
      .from("job_postings")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setJobs(data as JobPosting[]);
  };

  const fetchSubmissions = async () => {
    const { data } = await supabase
      .from("job_submissions")
      .select("*, job_postings(title)")
      .order("created_at", { ascending: false });
    if (data) setSubmissions(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
  };

  const openCreateForm = () => {
    setEditingJob(null);
    setForm(emptyJob);
    setView("form");
  };

  const openEditForm = (job: JobPosting) => {
    setEditingJob(job);
    setForm({
      title: job.title,
      company_name: job.company_name || "",
      location: job.location,
      job_type: job.job_type,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      description: job.description,
      requirements: job.requirements || "",
      application_email: job.application_email || "",
      deadline: job.deadline ? new Date(job.deadline).toISOString().split("T")[0] : "",
      category: job.category || "",
      experience_level: job.experience_level || "entry",
      skills: job.skills || [],
      is_active: job.is_active,
    });
    setView("form");
  };

  const handleSave = async () => {
    if (!userId) return;
    if (!form.title.trim() || !form.description.trim() || !form.location.trim()) {
      toast({ title: "Error", description: "Title, description, and location are required.", variant: "destructive" });
      return;
    }

    setSaving(true);

    const payload: any = {
      title: form.title.trim(),
      company_name: form.company_name?.trim() || null,
      location: form.location.trim(),
      job_type: form.job_type,
      salary_min: form.salary_min,
      salary_max: form.salary_max,
      description: form.description.trim(),
      requirements: form.requirements?.trim() || null,
      application_email: form.application_email?.trim() || null,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      category: form.category?.trim() || null,
      experience_level: form.experience_level,
      skills: form.skills.length > 0 ? form.skills : null,
      is_active: form.is_active,
    };

    if (editingJob) {
      const { error } = await supabase
        .from("job_postings")
        .update(payload)
        .eq("id", editingJob.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Job posting updated." });
      }
    } else {
      payload.employer_id = userId;
      const { error } = await supabase
        .from("job_postings")
        .insert(payload as JobInsert);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Success", description: "Job posting created." });
      }
    }

    setSaving(false);
    await fetchJobs();
    setView("list");
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    const { error } = await supabase.from("job_postings").delete().eq("id", jobId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Job posting removed." });
      fetchJobs();
    }
  };

  const toggleActive = async (job: JobPosting) => {
    const { error } = await supabase
      .from("job_postings")
      .update({ is_active: !job.is_active })
      .eq("id", job.id);
    if (!error) fetchJobs();
  };

  const filteredJobs = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.company_name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const jobTypeLabels: Record<string, string> = {
    full_time: "Full-time",
    part_time: "Part-time",
    contract: "Contract",
    temporary: "Temporary",
    internship: "Internship",
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-2">
              <LayoutDashboard className="w-8 h-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Manage job postings for inalressources.info</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="rounded-full"
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{jobs.length}</p>
                <p className="text-sm text-muted-foreground">Total Jobs</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{jobs.filter((j) => j.is_active).length}</p>
                <p className="text-sm text-muted-foreground">Active Jobs</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{submissions.length}</p>
                <p className="text-sm text-muted-foreground">Applications</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-border pb-3">
          <Button
            variant={view === "list" ? "default" : "ghost"}
            onClick={() => setView("list")}
            className="rounded-full"
          >
            <Briefcase className="w-4 h-4 mr-2" /> Job Postings
          </Button>
          <Button
            variant={view === "form" ? "default" : "ghost"}
            onClick={openCreateForm}
            className="rounded-full"
          >
            <Plus className="w-4 h-4 mr-2" /> New Job
          </Button>
          <Button
            variant={view === "submissions" ? "default" : "ghost"}
            onClick={() => setView("submissions")}
            className="rounded-full"
          >
            <FileText className="w-4 h-4 mr-2" /> Applications
          </Button>
        </div>

        {/* Job List View */}
        {view === "list" && (
          <div>
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <Button onClick={openCreateForm} className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <Plus className="w-4 h-4 mr-2" /> Add Job
              </Button>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-heading font-bold text-lg">No job postings yet</p>
                <p className="text-sm">Click "Add Job" to create your first posting.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-card border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-heading font-bold text-foreground truncate">{job.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${job.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {job.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {job.company_name && (
                          <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.company_name}</span>
                        )}
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                        <span className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full">
                          {jobTypeLabels[job.job_type] || job.job_type}
                        </span>
                        {job.deadline && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(job.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => toggleActive(job)} title="Toggle active">
                        <Eye className={`w-4 h-4 ${job.is_active ? "text-green-600" : "text-muted-foreground"}`} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditForm(job)}>
                        <Edit className="w-4 h-4 text-primary" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(job.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Job Form View */}
        {view === "form" && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-card border border-border rounded-xl p-8">
              <h2 className="text-xl font-heading font-bold text-foreground mb-6">
                {editingJob ? "Edit Job Posting" : "Create New Job Posting"}
              </h2>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Job Title <span className="text-destructive">*</span></Label>
                    <Input
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g. Warehouse Worker"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Company Name</Label>
                    <Input
                      value={form.company_name || ""}
                      onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                      placeholder="e.g. Acme Logistics"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Location <span className="text-destructive">*</span></Label>
                    <Input
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="e.g. Laval, QC"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Job Type</Label>
                    <Select value={form.job_type} onValueChange={(v: any) => setForm({ ...form, job_type: v })}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full-time</SelectItem>
                        <SelectItem value="part_time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="temporary">Temporary</SelectItem>
                        <SelectItem value="internship">Internship</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label>Min Salary ($)</Label>
                    <Input
                      type="number"
                      value={form.salary_min ?? ""}
                      onChange={(e) => setForm({ ...form, salary_min: e.target.value ? Number(e.target.value) : null })}
                      placeholder="40000"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Max Salary ($)</Label>
                    <Input
                      type="number"
                      value={form.salary_max ?? ""}
                      onChange={(e) => setForm({ ...form, salary_max: e.target.value ? Number(e.target.value) : null })}
                      placeholder="55000"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Experience Level</Label>
                    <Select value={form.experience_level} onValueChange={(v: any) => setForm({ ...form, experience_level: v })}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">Entry</SelectItem>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="mid">Mid</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Job Description <span className="text-destructive">*</span></Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Describe the role, responsibilities..."
                    rows={6}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Requirements</Label>
                  <Textarea
                    value={form.requirements || ""}
                    onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                    placeholder="List qualifications, certifications needed..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Application Email</Label>
                    <Input
                      type="email"
                      value={form.application_email || ""}
                      onChange={(e) => setForm({ ...form, application_email: e.target.value })}
                      placeholder="hr@company.com"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Application Deadline</Label>
                    <Input
                      type="date"
                      value={form.deadline}
                      onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Input
                      value={form.category || ""}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="e.g. Logistics, IT, Healthcare"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Skills (comma-separated)</Label>
                    <Input
                      value={(form.skills || []).join(", ")}
                      onChange={(e) => setForm({ ...form, skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                      placeholder="Forklift, English, Excel"
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                  />
                  <Label>Publish immediately (active)</Label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-heading font-bold px-8"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : editingJob ? "Update Job" : "Publish Job"}
                  </Button>
                  <Button variant="outline" onClick={() => setView("list")} className="rounded-full">
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submissions View */}
        {view === "submissions" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-heading font-bold text-foreground">Job Applications</h2>
              <div className="flex gap-2">
                {["all", "new", "reviewed", "interview", "rejected"].map((s) => (
                  <Button
                    key={s}
                    variant={statusFilter === s ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setStatusFilter(s)}
                    className="rounded-full capitalize text-xs"
                  >
                    {s === "all" ? "All" : s}
                    {s !== "all" && (
                      <span className="ml-1 text-xs opacity-70">
                        ({submissions.filter((sub: any) => (sub.status || "new") === s).length})
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>
            {filteredSubmissions.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-heading font-bold text-lg">No applications {statusFilter !== "all" ? `with status "${statusFilter}"` : "yet"}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSubmissions.map((sub: any) => (
                  <div
                    key={sub.id}
                    className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-heading font-bold text-foreground">{sub.full_name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            (sub.status || "new") === "new" ? "bg-blue-100 text-blue-700" :
                            sub.status === "reviewed" ? "bg-yellow-100 text-yellow-700" :
                            sub.status === "interview" ? "bg-green-100 text-green-700" :
                            sub.status === "rejected" ? "bg-red-100 text-red-700" :
                            "bg-secondary text-secondary-foreground"
                          }`}>
                            {(sub.status || "new").charAt(0).toUpperCase() + (sub.status || "new").slice(1)}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" />
                            <a href={`mailto:${sub.email}`} className="hover:text-primary hover:underline">{sub.email}</a>
                          </span>
                          {sub.phone && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />{sub.phone}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5" />{sub.job_postings?.title || "—"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />{new Date(sub.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {sub.city && <p className="text-xs text-muted-foreground mb-1">📍 {sub.city}</p>}
                        {sub.cover_letter && (
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1 italic">"{sub.cover_letter}"</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {sub.resume_url && (
                          <a
                            href={sub.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" /> Download CV
                          </a>
                        )}
                        <Select
                          value={sub.status || "new"}
                          onValueChange={(v) => updateSubmissionStatus(sub.id, v)}
                        >
                          <SelectTrigger className="h-9 w-32 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="reviewed">Reviewed</SelectItem>
                            <SelectItem value="interview">Interview</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSubmission(sub.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
