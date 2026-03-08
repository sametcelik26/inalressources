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
  Calendar, Save, X, Search, LayoutDashboard, FileText, Users, Mail,
  Download, Building2, User, Phone, Clock, ExternalLink, Globe
} from "lucide-react";
import Layout from "@/components/Layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/integrations/supabase/types";
import jsPDF from "jspdf";

type JobPosting = Database["public"]["Tables"]["job_postings"]["Row"];
type JobInsert = Database["public"]["Tables"]["job_postings"]["Insert"];

// Admin panel translations
const adminT = {
  en: {
    dashboard: "Admin Dashboard",
    dashboardDesc: "Manage job postings, applications, and forms — inalressources.info",
    logout: "Logout",
    jobPostings: "Job Postings",
    applications: "Applications",
    employers: "Employers",
    candidates: "Candidates",
    searchJobs: "Search jobs...",
    addJob: "Add Job",
    noJobsYet: "No job postings yet",
    active: "Active",
    inactive: "Inactive",
    editJobPosting: "Edit Job Posting",
    createNewJob: "Create New Job Posting",
    jobTitle: "Job Title",
    jobTitleFr: "Job Title (French)",
    companyName: "Company Name",
    location: "Location",
    jobType: "Job Type",
    minSalary: "Min Salary ($)",
    maxSalary: "Max Salary ($)",
    experienceLevel: "Experience Level",
    description: "Job Description",
    descriptionFr: "Job Description (French)",
    responsibilities: "Responsibilities",
    responsibilitiesFr: "Responsibilities (French)",
    skillsRequired: "Skills Required",
    skillsRequiredFr: "Skills Required (French)",
    conditions: "Conditions",
    conditionsFr: "Conditions (French)",
    benefits: "Benefits",
    benefitsFr: "Benefits (French)",
    requirements: "Requirements (Legacy)",
    requirementsFr: "Requirements (French)",
    applicationEmail: "Application Email / Link",
    applicationDeadline: "Application Deadline",
    category: "Category",
    skillsComma: "Skills (comma-separated)",
    publishImmediately: "Publish immediately (active)",
    saving: "Saving...",
    updateJob: "Update Job",
    publishJob: "Publish Job",
    cancel: "Cancel",
    deleteConfirm: "Delete this job posting?",
    deleteRecordConfirm: "Delete this record?",
    statusUpdated: "Status updated",
    deleted: "Deleted",
    error: "Error",
    success: "Success",
    jobUpdated: "Job posting updated.",
    jobCreated: "Job posting created.",
    requiredFields: "Title, description, and location are required.",
    jobApplications: "Job Applications",
    employerRequests: "Employer Requests",
    candidateRegistrations: "Candidate Registrations",
    contactMessages: "Messages",
    noApplications: "No applications",
    noEmployerRequests: "No employer requests",
    noCandidateRegistrations: "No candidate registrations",
    noContactMessages: "No contact messages",
    withStatus: "with status",
    yet: "yet",
    all: "All",
    new: "New",
    reviewed: "Reviewed",
    interview: "Interview",
    rejected: "Rejected",
    employees: "employees",
    legalRightToWork: "Legal right to work",
    languageOption: "Posting Language",
    langEn: "English only",
    langFr: "French only",
    langBoth: "Both (EN & FR)",
    langFilter: "All Languages",
    langFilterEn: "English",
    langFilterFr: "French",
    langFilterBoth: "Bilingual",
    frenchFields: "French Content",
    englishFields: "English Content",
    // Job type labels
    full_time: "Full-time",
    part_time: "Part-time",
    contract: "Contract",
    temporary: "Temporary",
    internship: "Internship",
    // Experience levels
    entry: "Entry",
    junior: "Junior",
    mid: "Mid",
    senior: "Senior",
    executive: "Executive",
    // PDF labels
    pdfTitle: "Title",
    pdfTitleFr: "Title (FR)",
    pdfCompany: "Company",
    pdfLocation: "Location",
    pdfLanguage: "Language",
    pdfType: "Type",
    pdfSalary: "Salary",
    pdfDescEn: "Description (EN)",
    pdfDescFr: "Description (FR)",
    pdfRespEn: "Responsibilities (EN)",
    pdfRespFr: "Responsibilities (FR)",
    pdfSkillsEn: "Skills Required (EN)",
    pdfSkillsFr: "Skills Required (FR)",
    pdfCondEn: "Conditions (EN)",
    pdfCondFr: "Conditions (FR)",
    pdfBenEn: "Benefits (EN)",
    pdfBenFr: "Benefits (FR)",
    pdfDeadline: "Deadline",
    pdfName: "Name",
    pdfFullName: "Full Name",
    pdfEmail: "Email",
    pdfPhone: "Phone",
    pdfCity: "City",
    pdfJobApplied: "Job Applied",
    pdfLinkedIn: "LinkedIn",
    pdfCoverLetter: "Cover Letter",
    pdfStatus: "Status",
    pdfSubmitted: "Submitted",
    pdfReceived: "Received",
    pdfContact: "Contact",
    pdfAddress: "Address",
    pdfIndustry: "Industry",
    pdfDepartment: "Department",
    pdfJobTitle: "Job Title",
    pdfDescription: "Description",
    pdfEmployeesNeeded: "Employees Needed",
    pdfSalaryRange: "Salary Range",
    pdfWorkSchedule: "Work Schedule",
    pdfRequiredSkills: "Required Skills",
    pdfStartDate: "Start Date",
    pdfUrgency: "Urgency",
    pdfPreferredContact: "Preferred Contact",
    pdfComments: "Comments",
    pdfAvailability: "Availability",
    pdfLicenseClass: "License Class",
    pdfWorkLocation: "Work Location",
    pdfLegalRight: "Legal Right to Work",
    pdfCV: "CV",
    pdfSubject: "Subject",
    pdfMessage: "Message",
    pdfAttached: "Attached",
    pdfNotProvided: "Not provided",
    pdfYes: "Yes",
    pdfNo: "No",
    cvDownloadError: "Could not generate download link.",
    notes: "Notes",
  },
  fr: {
    dashboard: "Tableau de bord admin",
    dashboardDesc: "Gérer les offres d'emploi, candidatures et formulaires — inalressources.info",
    logout: "Déconnexion",
    jobPostings: "Offres d'emploi",
    applications: "Candidatures",
    employers: "Employeurs",
    candidates: "Candidats",
    searchJobs: "Rechercher des emplois...",
    addJob: "Ajouter un emploi",
    noJobsYet: "Aucune offre d'emploi",
    active: "Actif",
    inactive: "Inactif",
    editJobPosting: "Modifier l'offre d'emploi",
    createNewJob: "Créer une nouvelle offre d'emploi",
    jobTitle: "Titre du poste",
    jobTitleFr: "Titre du poste (Français)",
    companyName: "Nom de l'entreprise",
    location: "Lieu",
    jobType: "Type d'emploi",
    minSalary: "Salaire min ($)",
    maxSalary: "Salaire max ($)",
    experienceLevel: "Niveau d'expérience",
    description: "Description du poste",
    descriptionFr: "Description du poste (Français)",
    responsibilities: "Responsabilités",
    responsibilitiesFr: "Responsabilités (Français)",
    skillsRequired: "Compétences recherchées",
    skillsRequiredFr: "Compétences recherchées (Français)",
    conditions: "Conditions",
    conditionsFr: "Conditions (Français)",
    benefits: "Avantages",
    benefitsFr: "Avantages (Français)",
    requirements: "Exigences (ancien)",
    requirementsFr: "Exigences (Français)",
    applicationEmail: "Courriel de candidature / Lien",
    applicationDeadline: "Date limite de candidature",
    category: "Catégorie",
    skillsComma: "Compétences (séparées par des virgules)",
    publishImmediately: "Publier immédiatement (actif)",
    saving: "Enregistrement...",
    updateJob: "Mettre à jour",
    publishJob: "Publier l'emploi",
    cancel: "Annuler",
    deleteConfirm: "Supprimer cette offre d'emploi?",
    deleteRecordConfirm: "Supprimer cet enregistrement?",
    statusUpdated: "Statut mis à jour",
    deleted: "Supprimé",
    error: "Erreur",
    success: "Succès",
    jobUpdated: "Offre d'emploi mise à jour.",
    jobCreated: "Offre d'emploi créée.",
    requiredFields: "Titre, description et lieu sont requis.",
    jobApplications: "Candidatures",
    employerRequests: "Demandes d'employeurs",
    candidateRegistrations: "Inscriptions de candidats",
    contactMessages: "Messages",
    noApplications: "Aucune candidature",
    noEmployerRequests: "Aucune demande d'employeur",
    noCandidateRegistrations: "Aucune inscription de candidat",
    noContactMessages: "Aucun message de contact",
    withStatus: "avec le statut",
    yet: "pour le moment",
    all: "Tous",
    new: "Nouveau",
    reviewed: "Examiné",
    interview: "Entrevue",
    rejected: "Rejeté",
    employees: "employés",
    legalRightToWork: "Droit légal de travailler",
    languageOption: "Langue de publication",
    langEn: "Anglais seulement",
    langFr: "Français seulement",
    langBoth: "Les deux (EN & FR)",
    langFilter: "Toutes les langues",
    langFilterEn: "Anglais",
    langFilterFr: "Français",
    langFilterBoth: "Bilingue",
    frenchFields: "Contenu en français",
    englishFields: "Contenu en anglais",
    // Job type labels
    full_time: "Temps plein",
    part_time: "Temps partiel",
    contract: "Contrat",
    temporary: "Temporaire",
    internship: "Stage",
    // Experience levels
    entry: "Débutant",
    junior: "Junior",
    mid: "Intermédiaire",
    senior: "Sénior",
    executive: "Exécutif",
    // PDF labels
    pdfTitle: "Titre",
    pdfTitleFr: "Titre (FR)",
    pdfCompany: "Entreprise",
    pdfLocation: "Lieu",
    pdfLanguage: "Langue",
    pdfType: "Type",
    pdfSalary: "Salaire",
    pdfDescEn: "Description (EN)",
    pdfDescFr: "Description (FR)",
    pdfRespEn: "Responsabilités (EN)",
    pdfRespFr: "Responsabilités (FR)",
    pdfSkillsEn: "Compétences requises (EN)",
    pdfSkillsFr: "Compétences requises (FR)",
    pdfCondEn: "Conditions (EN)",
    pdfCondFr: "Conditions (FR)",
    pdfBenEn: "Avantages (EN)",
    pdfBenFr: "Avantages (FR)",
    pdfDeadline: "Date limite",
    pdfName: "Nom",
    pdfFullName: "Nom complet",
    pdfEmail: "Courriel",
    pdfPhone: "Téléphone",
    pdfCity: "Ville",
    pdfJobApplied: "Poste visé",
    pdfLinkedIn: "LinkedIn",
    pdfCoverLetter: "Lettre de motivation",
    pdfStatus: "Statut",
    pdfSubmitted: "Soumis le",
    pdfReceived: "Reçu le",
    pdfContact: "Contact",
    pdfAddress: "Adresse",
    pdfIndustry: "Secteur",
    pdfDepartment: "Département",
    pdfJobTitle: "Titre du poste",
    pdfDescription: "Description",
    pdfEmployeesNeeded: "Employés nécessaires",
    pdfSalaryRange: "Échelle salariale",
    pdfWorkSchedule: "Horaire de travail",
    pdfRequiredSkills: "Compétences requises",
    pdfStartDate: "Date de début",
    pdfUrgency: "Urgence",
    pdfPreferredContact: "Contact préféré",
    pdfComments: "Commentaires",
    pdfAvailability: "Disponibilité",
    pdfLicenseClass: "Classe de permis",
    pdfWorkLocation: "Lieu de travail",
    pdfLegalRight: "Droit légal de travailler",
    pdfCV: "CV",
    pdfSubject: "Sujet",
    pdfMessage: "Message",
    pdfAttached: "Joint",
    pdfNotProvided: "Non fourni",
    pdfYes: "Oui",
    pdfNo: "Non",
    cvDownloadError: "Impossible de générer le lien de téléchargement.",
    notes: "Notes",
  },
};

const getJobTypeLabels = (t: typeof adminT.en) => ({
  full_time: t.full_time,
  part_time: t.part_time,
  contract: t.contract,
  temporary: t.temporary,
  internship: t.internship,
});

const emptyJob = {
  title: "",
  title_fr: "" as string,
  company_name: "" as string | null,
  location: "",
  job_type: "full_time" as Database["public"]["Enums"]["job_type"],
  salary_min: null as number | null,
  salary_max: null as number | null,
  description: "",
  description_fr: "" as string,
  responsibilities: "" as string | null,
  responsibilities_fr: "" as string,
  skills_required: "" as string | null,
  skills_required_fr: "" as string,
  conditions: "" as string | null,
  conditions_fr: "" as string,
  benefits: "" as string | null,
  benefits_fr: "" as string,
  requirements: "" as string | null,
  requirements_fr: "" as string,
  application_email: "" as string | null,
  deadline: "",
  category: "" as string | null,
  experience_level: "entry" as Database["public"]["Enums"]["experience_level"],
  skills: [] as string[],
  is_active: true,
  language_option: "en" as string,
};

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  reviewed: "bg-yellow-100 text-yellow-700",
  interview: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  pending: "bg-orange-100 text-orange-700",
};

const langBadge: Record<string, { label: string; color: string }> = {
  en: { label: "EN", color: "bg-blue-100 text-blue-700" },
  fr: { label: "FR", color: "bg-purple-100 text-purple-700" },
  both: { label: "EN/FR", color: "bg-green-100 text-green-700" },
};

// PDF export utility
const exportToPDF = (title: string, fields: { label: string; value: string }[]) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.setTextColor(13, 59, 102);
  doc.text(title, 20, 25);
  doc.setDrawColor(13, 59, 102);
  doc.line(20, 30, 190, 30);
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  let y = 42;
  fields.forEach(({ label, value }) => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 20, y);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(value || "—", 130);
    doc.text(lines, 65, y);
    y += Math.max(lines.length * 6, 8);
  });
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Generated on ${new Date().toLocaleString()} — inalressources.info`, 20, 285);
  doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
};

const AdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Admin panel language (independent from site language)
  const [adminLang, setAdminLang] = useState<"en" | "fr">("en");
  const at = adminT[adminLang];
  const jobTypeLabels = getJobTypeLabels(at);

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("jobs");

  // Data states
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [employerRequests, setEmployerRequests] = useState<any[]>([]);
  const [candidateApps, setCandidateApps] = useState<any[]>([]);
  const [contactMessages, setContactMessages] = useState<any[]>([]);

  // Job form states
  const [jobView, setJobView] = useState<"list" | "form">("list");
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [form, setForm] = useState(emptyJob);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [langFilter, setLangFilter] = useState("all");

  // Filter states
  const [submissionFilter, setSubmissionFilter] = useState("all");
  const [employerFilter, setEmployerFilter] = useState("all");
  const [candidateFilter, setCandidateFilter] = useState("all");

  // Auth check
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin"); return; }
      const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });
      if (roleError || !isAdmin) {
        await supabase.auth.signOut();
        navigate("/admin");
        return;
      }
      setUserId(session.user.id);
      setLoading(false);
    };
    checkAdmin();
  }, [navigate]);

  useEffect(() => { if (userId) fetchAll(); }, [userId]);

  const fetchAll = () => { fetchJobs(); fetchSubmissions(); fetchEmployerRequests(); fetchCandidateApps(); fetchContactMessages(); };

  const fetchJobs = async () => {
    const { data } = await supabase.from("job_postings").select("*").order("created_at", { ascending: false });
    if (data) setJobs(data);
  };
  const fetchSubmissions = async () => {
    const { data } = await supabase.from("job_submissions").select("*, job_postings(title)").order("created_at", { ascending: false });
    if (data) setSubmissions(data);
  };
  const fetchEmployerRequests = async () => {
    const { data } = await supabase.from("employer_requests").select("*").order("created_at", { ascending: false });
    if (data) setEmployerRequests(data);
  };
  const fetchCandidateApps = async () => {
    const { data } = await supabase.from("candidate_applications").select("*").order("created_at", { ascending: false });
    if (data) setCandidateApps(data);
  };
  const fetchContactMessages = async () => {
    const { data } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
    if (data) setContactMessages(data);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate("/admin"); };

  // ─── Job CRUD ───
  const openCreateForm = () => { setEditingJob(null); setForm(emptyJob); setJobView("form"); };
  const openEditForm = (job: JobPosting) => {
    setEditingJob(job);
    setForm({
      title: job.title,
      title_fr: (job as any).title_fr || "",
      company_name: job.company_name || "",
      location: job.location,
      job_type: job.job_type,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      description: job.description,
      description_fr: (job as any).description_fr || "",
      responsibilities: (job as any).responsibilities || "",
      responsibilities_fr: (job as any).responsibilities_fr || "",
      skills_required: (job as any).skills_required || "",
      skills_required_fr: (job as any).skills_required_fr || "",
      conditions: (job as any).conditions || "",
      conditions_fr: (job as any).conditions_fr || "",
      benefits: (job as any).benefits || "",
      benefits_fr: (job as any).benefits_fr || "",
      requirements: job.requirements || "",
      requirements_fr: (job as any).requirements_fr || "",
      application_email: job.application_email || "",
      deadline: job.deadline ? new Date(job.deadline).toISOString().split("T")[0] : "",
      category: job.category || "",
      experience_level: job.experience_level || "entry",
      skills: job.skills || [],
      is_active: job.is_active,
      language_option: (job as any).language_option || "en",
    });
    setJobView("form");
  };

  const handleSaveJob = async () => {
    if (!userId) return;
    if (!form.title.trim() || !form.description.trim() || !form.location.trim()) {
      toast({ title: at.error, description: at.requiredFields, variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload: any = {
      title: form.title.trim(),
      title_fr: form.title_fr?.trim() || null,
      company_name: form.company_name?.trim() || null,
      location: form.location.trim(),
      job_type: form.job_type,
      salary_min: form.salary_min,
      salary_max: form.salary_max,
      description: form.description.trim(),
      description_fr: form.description_fr?.trim() || null,
      responsibilities: form.responsibilities?.trim() || null,
      responsibilities_fr: form.responsibilities_fr?.trim() || null,
      skills_required: form.skills_required?.trim() || null,
      skills_required_fr: form.skills_required_fr?.trim() || null,
      conditions: form.conditions?.trim() || null,
      conditions_fr: form.conditions_fr?.trim() || null,
      benefits: form.benefits?.trim() || null,
      benefits_fr: form.benefits_fr?.trim() || null,
      requirements: form.requirements?.trim() || null,
      requirements_fr: form.requirements_fr?.trim() || null,
      application_email: form.application_email?.trim() || null,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      category: form.category?.trim() || null,
      experience_level: form.experience_level,
      skills: form.skills.length > 0 ? form.skills : null,
      is_active: form.is_active,
      language_option: form.language_option,
    };
    if (editingJob) {
      const { error } = await supabase.from("job_postings").update(payload).eq("id", editingJob.id);
      if (error) toast({ title: at.error, description: error.message, variant: "destructive" });
      else toast({ title: at.success, description: at.jobUpdated });
    } else {
      payload.employer_id = userId;
      const { error } = await supabase.from("job_postings").insert(payload as JobInsert);
      if (error) toast({ title: at.error, description: error.message, variant: "destructive" });
      else toast({ title: at.success, description: at.jobCreated });
    }
    setSaving(false);
    await fetchJobs();
    setJobView("list");
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm(at.deleteConfirm)) return;
    const { error } = await supabase.from("job_postings").delete().eq("id", id);
    if (!error) { toast({ title: at.deleted }); fetchJobs(); }
  };

  const toggleActive = async (job: JobPosting) => {
    await supabase.from("job_postings").update({ is_active: !job.is_active }).eq("id", job.id);
    fetchJobs();
  };

  const updateStatus = async (table: "job_submissions" | "employer_requests" | "candidate_applications", id: string, status: string, setter: Function) => {
    const { error } = await (supabase.from(table) as any).update({ status }).eq("id", id);
    if (!error) {
      setter((prev: any[]) => prev.map((r) => r.id === id ? { ...r, status } : r));
      toast({ title: at.statusUpdated });
    }
  };

  const deleteRecord = async (table: "job_submissions" | "employer_requests" | "candidate_applications" | "contact_messages", id: string, setter: Function) => {
    if (!confirm(at.deleteRecordConfirm)) return;
    const { error } = await (supabase.from(table) as any).delete().eq("id", id);
    if (!error) {
      setter((prev: any[]) => prev.filter((r) => r.id !== id));
      toast({ title: at.deleted });
    }
  };

  // ─── Filtered data ───
  const filteredJobs = jobs
    .filter((j) =>
      j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      j.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (j.company_name || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((j) => {
      if (langFilter === "all") return true;
      return (j as any).language_option === langFilter;
    });

  const filterByStatus = (data: any[], filter: string) =>
    filter === "all" ? data : data.filter((d) => (d.status || "new") === filter);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  const StatusBadge = ({ status }: { status: string }) => (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[status] || "bg-secondary text-secondary-foreground"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );

  const StatusFilters = ({ filter, setFilter, data }: { filter: string; setFilter: (v: string) => void; data: any[] }) => (
    <div className="flex flex-wrap gap-1">
      {["all", "new", "reviewed", "interview", "rejected"].map((s) => (
        <Button key={s} variant={filter === s ? "default" : "ghost"} size="sm"
          onClick={() => setFilter(s)} className="rounded-full capitalize text-xs">
          {s === "all" ? at.all : s}
          {s !== "all" && <span className="ml-1 opacity-70">({data.filter((d) => (d.status || "new") === s).length})</span>}
        </Button>
      ))}
    </div>
  );

  const getCvDownloadUrl = async (path: string): Promise<string | null> => {
    if (!path) return null;
    // Extract storage path from full public URL if needed
    let storagePath = path;
    const bucketMarker = "/candidate-cvs/";
    const idx = path.indexOf(bucketMarker);
    if (idx !== -1) {
      storagePath = path.substring(idx + bucketMarker.length);
    }
    const { data } = await supabase.storage.from("candidate-cvs").createSignedUrl(storagePath, 3600);
    return data?.signedUrl || null;
  };

  const handleCvDownload = async (path: string) => {
    const url = await getCvDownloadUrl(path);
    if (url) window.open(url, "_blank");
    else toast({ title: at.error, description: "Could not generate download link.", variant: "destructive" });
  };

  const showEnFields = form.language_option === "en" || form.language_option === "both";
  const showFrFields = form.language_option === "fr" || form.language_option === "both";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-2">
              <LayoutDashboard className="w-8 h-8 text-primary" />
              {at.dashboard}
            </h1>
            <p className="text-muted-foreground mt-1">{at.dashboardDesc}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Admin Language Toggle */}
            <div className="flex items-center gap-1 bg-secondary rounded-full p-1">
              <button
                onClick={() => setAdminLang("en")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${adminLang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                EN
              </button>
              <button
                onClick={() => setAdminLang("fr")}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${adminLang === "fr" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                FR
              </button>
            </div>
            <Button variant="outline" onClick={handleLogout} className="rounded-full">
              <LogOut className="w-4 h-4 mr-2" /> {at.logout}
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {[
            { icon: Briefcase, label: at.jobPostings, count: jobs.length, color: "text-primary" },
            { icon: FileText, label: at.applications, count: submissions.length, color: "text-accent" },
            { icon: Building2, label: at.employerRequests, count: employerRequests.length, color: "text-green-600" },
            { icon: Users, label: at.candidates, count: candidateApps.length, color: "text-purple-600" },
            { icon: Mail, label: at.contactMessages, count: contactMessages.length, color: "text-orange-600" },
          ].map(({ icon: Icon, label, count, color }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{count}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="jobs" className="text-xs sm:text-sm">
              <Briefcase className="w-4 h-4 mr-1 hidden sm:inline" /> {at.jobPostings}
            </TabsTrigger>
            <TabsTrigger value="applications" className="text-xs sm:text-sm">
              <FileText className="w-4 h-4 mr-1 hidden sm:inline" /> {at.applications}
            </TabsTrigger>
            <TabsTrigger value="employers" className="text-xs sm:text-sm">
              <Building2 className="w-4 h-4 mr-1 hidden sm:inline" /> {at.employers}
            </TabsTrigger>
            <TabsTrigger value="candidates" className="text-xs sm:text-sm">
              <Users className="w-4 h-4 mr-1 hidden sm:inline" /> {at.candidates}
            </TabsTrigger>
            <TabsTrigger value="messages" className="text-xs sm:text-sm">
              <Mail className="w-4 h-4 mr-1 hidden sm:inline" /> {at.contactMessages}
            </TabsTrigger>
          </TabsList>

          {/* ═══ TAB 1: JOB POSTINGS ═══ */}
          <TabsContent value="jobs">
            {jobView === "list" ? (
              <div>
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder={at.searchJobs} value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-11" />
                  </div>
                  <Select value={langFilter} onValueChange={setLangFilter}>
                    <SelectTrigger className="w-40 h-11">
                      <Globe className="w-4 h-4 mr-1" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{at.langFilter}</SelectItem>
                      <SelectItem value="en">{at.langFilterEn}</SelectItem>
                      <SelectItem value="fr">{at.langFilterFr}</SelectItem>
                      <SelectItem value="both">{at.langFilterBoth}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={openCreateForm} className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Plus className="w-4 h-4 mr-2" /> {at.addJob}
                  </Button>
                </div>

                {filteredJobs.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p className="font-heading font-bold text-lg">{at.noJobsYet}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredJobs.map((job) => {
                      const lo = (job as any).language_option || "en";
                      const lb = langBadge[lo] || langBadge.en;
                      return (
                        <div key={job.id} className="bg-card border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-primary/30 transition-colors">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-heading font-bold text-foreground truncate">{job.title}</h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${job.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                {job.is_active ? at.active : at.inactive}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lb.color}`}>
                                {lb.label}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                              {job.company_name && <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{job.company_name}</span>}
                              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                              <span className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full">{jobTypeLabels[job.job_type] || job.job_type}</span>
                              {job.deadline && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(job.deadline).toLocaleDateString()}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button variant="ghost" size="sm" onClick={() => toggleActive(job)} title="Toggle active">
                              <Eye className={`w-4 h-4 ${job.is_active ? "text-green-600" : "text-muted-foreground"}`} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openEditForm(job)}>
                              <Edit className="w-4 h-4 text-primary" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteJob(job.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => exportToPDF(`Job_${job.title}`, [
                              { label: "Title", value: job.title },
                              { label: "Title (FR)", value: (job as any).title_fr || "" },
                              { label: "Company", value: job.company_name || "" },
                              { label: "Location", value: job.location },
                              { label: "Language", value: lo.toUpperCase() },
                              { label: "Type", value: jobTypeLabels[job.job_type] || job.job_type },
                              { label: "Salary", value: `${job.salary_min || "—"} – ${job.salary_max || "—"}` },
                              { label: "Description (EN)", value: job.description },
                              { label: "Description (FR)", value: (job as any).description_fr || "" },
                              { label: "Responsibilities (EN)", value: (job as any).responsibilities || "" },
                              { label: "Responsibilities (FR)", value: (job as any).responsibilities_fr || "" },
                              { label: "Skills Required (EN)", value: (job as any).skills_required || "" },
                              { label: "Skills Required (FR)", value: (job as any).skills_required_fr || "" },
                              { label: "Conditions (EN)", value: (job as any).conditions || "" },
                              { label: "Conditions (FR)", value: (job as any).conditions_fr || "" },
                              { label: "Benefits (EN)", value: (job as any).benefits || "" },
                              { label: "Benefits (FR)", value: (job as any).benefits_fr || "" },
                              { label: "Deadline", value: job.deadline ? new Date(job.deadline).toLocaleDateString() : "" },
                            ])} title="Export PDF">
                              <Download className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* ─── Job Form ─── */
              <div className="max-w-3xl mx-auto">
                <div className="bg-card border border-border rounded-xl p-8">
                  <h2 className="text-xl font-heading font-bold text-foreground mb-6">
                    {editingJob ? at.editJobPosting : at.createNewJob}
                  </h2>
                  <div className="space-y-5">
                    {/* Language Option */}
                    <div className="bg-secondary/50 border border-border rounded-lg p-4 space-y-2">
                      <Label className="flex items-center gap-2 font-bold">
                        <Globe className="w-4 h-4 text-primary" /> {at.languageOption}
                      </Label>
                      <Select value={form.language_option} onValueChange={(v) => setForm({ ...form, language_option: v })}>
                        <SelectTrigger className="h-11 w-full sm:w-64"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">{at.langEn}</SelectItem>
                          <SelectItem value="fr">{at.langFr}</SelectItem>
                          <SelectItem value="both">{at.langBoth}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Title */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {showEnFields && (
                        <div className="space-y-1.5">
                          <Label>{at.jobTitle} {form.language_option === "both" && "(EN)"} <span className="text-destructive">*</span></Label>
                          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Warehouse Worker" className="h-11" />
                        </div>
                      )}
                      {showFrFields && (
                        <div className="space-y-1.5">
                          <Label>{at.jobTitleFr} {form.language_option === "fr" && <span className="text-destructive">*</span>}</Label>
                          <Input value={form.title_fr} onChange={(e) => setForm({ ...form, title_fr: e.target.value })} placeholder="ex. Manutentionnaire" className="h-11" />
                        </div>
                      )}
                      <div className="space-y-1.5">
                        <Label>{at.companyName}</Label>
                        <Input value={form.company_name || ""} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="e.g. Acme Logistics" className="h-11" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>{at.location} <span className="text-destructive">*</span></Label>
                        <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Laval, QC" className="h-11" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{at.jobType}</Label>
                        <Select value={form.job_type} onValueChange={(v: any) => setForm({ ...form, job_type: v })}>
                          <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.entries(jobTypeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label>{at.minSalary}</Label>
                        <Input type="number" value={form.salary_min ?? ""} onChange={(e) => setForm({ ...form, salary_min: e.target.value ? Number(e.target.value) : null })} className="h-11" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{at.maxSalary}</Label>
                        <Input type="number" value={form.salary_max ?? ""} onChange={(e) => setForm({ ...form, salary_max: e.target.value ? Number(e.target.value) : null })} className="h-11" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{at.experienceLevel}</Label>
                        <Select value={form.experience_level} onValueChange={(v: any) => setForm({ ...form, experience_level: v })}>
                          <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
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

                    {/* Description */}
                    {showEnFields && (
                      <div className="space-y-1.5">
                        <Label>{at.description} {form.language_option === "both" && "(EN)"} <span className="text-destructive">*</span></Label>
                        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} placeholder="Describe the role and its purpose..." />
                      </div>
                    )}
                    {showFrFields && (
                      <div className="space-y-1.5">
                        <Label>{at.descriptionFr}</Label>
                        <Textarea value={form.description_fr} onChange={(e) => setForm({ ...form, description_fr: e.target.value })} rows={5} placeholder="Décrivez le rôle et son objectif..." />
                      </div>
                    )}

                    {/* Responsibilities */}
                    {showEnFields && (
                      <div className="space-y-1.5">
                        <Label>{at.responsibilities} {form.language_option === "both" && "(EN)"}</Label>
                        <Textarea value={form.responsibilities || ""} onChange={(e) => setForm({ ...form, responsibilities: e.target.value })} rows={4} placeholder="List the key responsibilities..." />
                      </div>
                    )}
                    {showFrFields && (
                      <div className="space-y-1.5">
                        <Label>{at.responsibilitiesFr}</Label>
                        <Textarea value={form.responsibilities_fr} onChange={(e) => setForm({ ...form, responsibilities_fr: e.target.value })} rows={4} placeholder="Listez les responsabilités principales..." />
                      </div>
                    )}

                    {/* Skills Required */}
                    {showEnFields && (
                      <div className="space-y-1.5">
                        <Label>{at.skillsRequired} {form.language_option === "both" && "(EN)"}</Label>
                        <Textarea value={form.skills_required || ""} onChange={(e) => setForm({ ...form, skills_required: e.target.value })} rows={3} placeholder="Required skills and qualifications..." />
                      </div>
                    )}
                    {showFrFields && (
                      <div className="space-y-1.5">
                        <Label>{at.skillsRequiredFr}</Label>
                        <Textarea value={form.skills_required_fr} onChange={(e) => setForm({ ...form, skills_required_fr: e.target.value })} rows={3} placeholder="Compétences et qualifications requises..." />
                      </div>
                    )}

                    {/* Conditions */}
                    {showEnFields && (
                      <div className="space-y-1.5">
                        <Label>{at.conditions} {form.language_option === "both" && "(EN)"}</Label>
                        <Textarea value={form.conditions || ""} onChange={(e) => setForm({ ...form, conditions: e.target.value })} rows={3} placeholder="Working conditions, schedule, etc." />
                      </div>
                    )}
                    {showFrFields && (
                      <div className="space-y-1.5">
                        <Label>{at.conditionsFr}</Label>
                        <Textarea value={form.conditions_fr} onChange={(e) => setForm({ ...form, conditions_fr: e.target.value })} rows={3} placeholder="Conditions de travail, horaire, etc." />
                      </div>
                    )}

                    {/* Benefits */}
                    {showEnFields && (
                      <div className="space-y-1.5">
                        <Label>{at.benefits} {form.language_option === "both" && "(EN)"}</Label>
                        <Textarea value={form.benefits || ""} onChange={(e) => setForm({ ...form, benefits: e.target.value })} rows={3} placeholder="Benefits offered with this position..." />
                      </div>
                    )}
                    {showFrFields && (
                      <div className="space-y-1.5">
                        <Label>{at.benefitsFr}</Label>
                        <Textarea value={form.benefits_fr} onChange={(e) => setForm({ ...form, benefits_fr: e.target.value })} rows={3} placeholder="Avantages offerts avec ce poste..." />
                      </div>
                    )}

                    {/* Requirements (Legacy) */}
                    {showEnFields && (
                      <div className="space-y-1.5">
                        <Label>{at.requirements} {form.language_option === "both" && "(EN)"}</Label>
                        <Textarea value={form.requirements || ""} onChange={(e) => setForm({ ...form, requirements: e.target.value })} rows={3} placeholder="Additional requirements..." />
                      </div>
                    )}
                    {showFrFields && (
                      <div className="space-y-1.5">
                        <Label>{at.requirementsFr}</Label>
                        <Textarea value={form.requirements_fr} onChange={(e) => setForm({ ...form, requirements_fr: e.target.value })} rows={3} placeholder="Exigences supplémentaires..." />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>{at.applicationEmail}</Label>
                        <Input type="email" value={form.application_email || ""} onChange={(e) => setForm({ ...form, application_email: e.target.value })} className="h-11" placeholder="e.g. hr@company.com" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{at.applicationDeadline}</Label>
                        <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="h-11" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>{at.category}</Label>
                        <Input value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-11" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{at.skillsComma}</Label>
                        <Input value={(form.skills || []).join(", ")} onChange={(e) => setForm({ ...form, skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="h-11" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch checked={form.is_active} onCheckedChange={(checked) => setForm({ ...form, is_active: checked })} />
                      <Label>{at.publishImmediately}</Label>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button onClick={handleSaveJob} disabled={saving} className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-heading font-bold px-8">
                        <Save className="w-4 h-4 mr-2" /> {saving ? at.saving : editingJob ? at.updateJob : at.publishJob}
                      </Button>
                      <Button variant="outline" onClick={() => setJobView("list")} className="rounded-full">
                        <X className="w-4 h-4 mr-2" /> {at.cancel}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ═══ TAB 2: JOB APPLICATIONS ═══ */}
          <TabsContent value="applications">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-heading font-bold text-foreground">{at.jobApplications}</h2>
              <StatusFilters filter={submissionFilter} setFilter={setSubmissionFilter} data={submissions} />
            </div>
            {filterByStatus(submissions, submissionFilter).length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-heading font-bold text-lg">{at.noApplications} {submissionFilter !== "all" ? `${at.withStatus} "${submissionFilter}"` : at.yet}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filterByStatus(submissions, submissionFilter).map((sub: any) => (
                  <div key={sub.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-heading font-bold text-foreground">{sub.full_name}</h3>
                          <StatusBadge status={sub.status || "new"} />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /><a href={`mailto:${sub.email}`} className="hover:text-primary hover:underline">{sub.email}</a></span>
                          {sub.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{sub.phone}</span>}
                          <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{sub.job_postings?.title || "—"}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(sub.created_at).toLocaleDateString()}</span>
                        </div>
                        {sub.city && <p className="text-xs text-muted-foreground mb-1">📍 {sub.city}</p>}
                        {sub.linkedin_url && <p className="text-xs text-muted-foreground mb-1"><a href={sub.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> LinkedIn</a></p>}
                        {sub.cover_letter && <p className="text-xs text-muted-foreground line-clamp-2 mt-1 italic">"{sub.cover_letter}"</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {sub.resume_url && (
                          <Button variant="outline" size="sm" onClick={() => handleCvDownload(sub.resume_url)} className="rounded-full text-xs">
                            <Download className="w-3.5 h-3.5 mr-1" /> CV
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => exportToPDF(`Application_${sub.full_name}`, [
                          { label: "Name", value: sub.full_name },
                          { label: "Email", value: sub.email },
                          { label: "Phone", value: sub.phone || "" },
                          { label: "City", value: sub.city || "" },
                          { label: "Job Applied", value: sub.job_postings?.title || "" },
                          { label: "LinkedIn", value: sub.linkedin_url || "" },
                          { label: "Cover Letter", value: sub.cover_letter || "" },
                          { label: "Status", value: sub.status || "new" },
                          { label: "Submitted", value: new Date(sub.created_at).toLocaleString() },
                        ])}>
                          <FileText className="w-3.5 h-3.5 mr-1" /> PDF
                        </Button>
                        <Select value={sub.status || "new"} onValueChange={(v) => updateStatus("job_submissions", sub.id, v, setSubmissions)}>
                          <SelectTrigger className="h-9 w-32 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">{at.new}</SelectItem>
                            <SelectItem value="reviewed">{at.reviewed}</SelectItem>
                            <SelectItem value="interview">{at.interview}</SelectItem>
                            <SelectItem value="rejected">{at.rejected}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="sm" onClick={() => deleteRecord("job_submissions", sub.id, setSubmissions)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ═══ TAB 3: EMPLOYER REQUESTS ═══ */}
          <TabsContent value="employers">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-heading font-bold text-foreground">{at.employerRequests}</h2>
              <StatusFilters filter={employerFilter} setFilter={setEmployerFilter} data={employerRequests} />
            </div>
            {filterByStatus(employerRequests, employerFilter).length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-heading font-bold text-lg">{at.noEmployerRequests} {employerFilter !== "all" ? `${at.withStatus} "${employerFilter}"` : at.yet}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filterByStatus(employerRequests, employerFilter).map((req: any) => (
                  <div key={req.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-heading font-bold text-foreground">{req.company_name}</h3>
                          <StatusBadge status={req.status || "new"} />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{req.contact_person}</span>
                          <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /><a href={`mailto:${req.email}`} className="hover:text-primary hover:underline">{req.email}</a></span>
                          {req.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{req.phone}</span>}
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(req.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-1">
                          {req.industry && <Badge variant="secondary" className="text-xs">{req.industry}</Badge>}
                          {req.job_title && <Badge variant="outline" className="text-xs">{req.job_title}</Badge>}
                          {req.urgency && req.urgency !== "normal" && <Badge variant="destructive" className="text-xs">{req.urgency}</Badge>}
                          {req.employees_needed && <span>👥 {req.employees_needed} {at.employees}</span>}
                        </div>
                        {req.job_description && <p className="text-xs text-muted-foreground line-clamp-2 mt-1">"{req.job_description}"</p>}
                        {req.comments && <p className="text-xs text-muted-foreground line-clamp-1 mt-1 italic">Notes: {req.comments}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => exportToPDF(`Employer_${req.company_name}`, [
                          { label: "Company", value: req.company_name },
                          { label: "Contact", value: req.contact_person },
                          { label: "Email", value: req.email },
                          { label: "Phone", value: req.phone || "" },
                          { label: "Address", value: req.company_address || "" },
                          { label: "Industry", value: req.industry || "" },
                          { label: "Department", value: req.department || "" },
                          { label: "Job Title", value: req.job_title || "" },
                          { label: "Description", value: req.job_description || "" },
                          { label: "Employees Needed", value: req.employees_needed?.toString() || "" },
                          { label: "Salary Range", value: req.salary_range || "" },
                          { label: "Work Schedule", value: req.work_schedule || "" },
                          { label: "Required Skills", value: req.required_skills || "" },
                          { label: "Start Date", value: req.start_date || "" },
                          { label: "Urgency", value: req.urgency || "" },
                          { label: "Preferred Contact", value: req.preferred_contact || "" },
                          { label: "Comments", value: req.comments || "" },
                          { label: "Status", value: req.status || "new" },
                          { label: "Submitted", value: new Date(req.created_at).toLocaleString() },
                        ])}>
                          <FileText className="w-3.5 h-3.5 mr-1" /> PDF
                        </Button>
                        <Select value={req.status || "new"} onValueChange={(v) => updateStatus("employer_requests", req.id, v, setEmployerRequests)}>
                          <SelectTrigger className="h-9 w-32 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">{at.new}</SelectItem>
                            <SelectItem value="reviewed">{at.reviewed}</SelectItem>
                            <SelectItem value="interview">{at.interview}</SelectItem>
                            <SelectItem value="rejected">{at.rejected}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="sm" onClick={() => deleteRecord("employer_requests", req.id, setEmployerRequests)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ═══ TAB 4: CANDIDATE REGISTRATIONS ═══ */}
          <TabsContent value="candidates">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-heading font-bold text-foreground">{at.candidateRegistrations}</h2>
              <StatusFilters filter={candidateFilter} setFilter={setCandidateFilter} data={candidateApps} />
            </div>
            {filterByStatus(candidateApps, candidateFilter).length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-heading font-bold text-lg">{at.noCandidateRegistrations} {candidateFilter !== "all" ? `${at.withStatus} "${candidateFilter}"` : at.yet}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filterByStatus(candidateApps, candidateFilter).map((app: any) => (
                  <div key={app.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-heading font-bold text-foreground">{app.full_name}</h3>
                          <StatusBadge status={app.status || "new"} />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /><a href={`mailto:${app.email}`} className="hover:text-primary hover:underline">{app.email}</a></span>
                          <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{app.phone}</span>
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(app.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-1">
                          {app.industry && <Badge variant="secondary" className="text-xs">{app.industry}</Badge>}
                          {app.work_location && <Badge variant="outline" className="text-xs">📍 {app.work_location}</Badge>}
                          {app.availability && <Badge variant="outline" className="text-xs">⏰ {app.availability}</Badge>}
                          {app.license_class && <Badge variant="outline" className="text-xs">🚗 {app.license_class}</Badge>}
                          {app.legal_right_to_work && <Badge className="text-xs bg-green-100 text-green-700">✓ {at.legalRightToWork}</Badge>}
                        </div>
                        {app.comments && <p className="text-xs text-muted-foreground line-clamp-2 mt-1 italic">"{app.comments}"</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        {app.cv_url && (
                          <Button variant="outline" size="sm" onClick={() => handleCvDownload(app.cv_url)} className="rounded-full text-xs">
                            <Download className="w-3.5 h-3.5 mr-1" /> CV
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => exportToPDF(`Candidate_${app.full_name}`, [
                          { label: "Full Name", value: app.full_name },
                          { label: "Email", value: app.email },
                          { label: "Phone", value: app.phone },
                          { label: "Availability", value: app.availability || "" },
                          { label: "License Class", value: app.license_class || "" },
                          { label: "Industry", value: app.industry || "" },
                          { label: "Work Location", value: app.work_location || "" },
                          { label: "Legal Right to Work", value: app.legal_right_to_work ? "Yes" : "No" },
                          { label: "Preferred Contact", value: app.preferred_contact || "" },
                          { label: "Comments", value: app.comments || "" },
                          { label: "CV", value: app.cv_url ? "Attached" : "Not provided" },
                          { label: "Status", value: app.status || "new" },
                          { label: "Submitted", value: new Date(app.created_at).toLocaleString() },
                        ])}>
                          <FileText className="w-3.5 h-3.5 mr-1" /> PDF
                        </Button>
                        <Select value={app.status || "new"} onValueChange={(v) => updateStatus("candidate_applications", app.id, v, setCandidateApps)}>
                          <SelectTrigger className="h-9 w-32 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">{at.new}</SelectItem>
                            <SelectItem value="reviewed">{at.reviewed}</SelectItem>
                            <SelectItem value="interview">{at.interview}</SelectItem>
                            <SelectItem value="rejected">{at.rejected}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="sm" onClick={() => deleteRecord("candidate_applications", app.id, setCandidateApps)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ═══ TAB 5: CONTACT MESSAGES ═══ */}
          <TabsContent value="messages">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-heading font-bold text-foreground">{at.contactMessages}</h2>
            </div>
            {contactMessages.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-heading font-bold text-lg">{at.noContactMessages} {at.yet}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contactMessages.map((msg: any) => (
                  <div key={msg.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-heading font-bold text-foreground">{msg.name}</h3>
                          <Badge variant="secondary" className="text-xs">{msg.subject}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /><a href={`mailto:${msg.email}`} className="hover:text-primary hover:underline">{msg.email}</a></span>
                          {msg.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{msg.phone}</span>}
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(msg.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <Button variant="outline" size="sm" className="rounded-full text-xs" onClick={() => exportToPDF(`Contact_${msg.name}`, [
                          { label: "Name", value: msg.name },
                          { label: "Email", value: msg.email },
                          { label: "Phone", value: msg.phone || "" },
                          { label: "Subject", value: msg.subject },
                          { label: "Message", value: msg.message },
                          { label: "Received", value: new Date(msg.created_at).toLocaleString() },
                        ])}>
                          <FileText className="w-3.5 h-3.5 mr-1" /> PDF
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteRecord("contact_messages", msg.id, setContactMessages)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
