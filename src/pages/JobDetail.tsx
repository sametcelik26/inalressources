import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Clock, DollarSign, Briefcase, Calendar, ArrowLeft, Send } from "lucide-react";
import Layout from "@/components/Layout";
import type { Database } from "@/integrations/supabase/types";

type JobPosting = Database["public"]["Tables"]["job_postings"]["Row"];

const jobTypeLabels: Record<string, { en: string; fr: string }> = {
  full_time: { en: "Full Time", fr: "Temps plein" },
  part_time: { en: "Part Time", fr: "Temps partiel" },
  contract: { en: "Contract", fr: "Contrat" },
  temporary: { en: "Temporary", fr: "Temporaire" },
  internship: { en: "Internship", fr: "Stage" },
};

const experienceLabels: Record<string, { en: string; fr: string }> = {
  entry: { en: "Entry Level", fr: "Débutant" },
  junior: { en: "Junior", fr: "Junior" },
  mid: { en: "Mid Level", fr: "Intermédiaire" },
  senior: { en: "Senior", fr: "Sénior" },
  executive: { en: "Executive", fr: "Exécutif" },
};

const JobDetail = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const { user, role } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);

  useEffect(() => {
    if (id) {
      supabase.from("job_postings").select("*").eq("id", id).single().then(({ data }) => setJob(data));
      if (user) {
        supabase.from("job_applications").select("id").eq("job_id", id).eq("seeker_id", user.id).maybeSingle()
          .then(({ data }) => setHasApplied(!!data));
      }
    }
  }, [id, user]);

  const handleApply = async () => {
    if (!user || !id) return;
    setApplying(true);
    const { error } = await supabase.from("job_applications").insert({
      job_id: id,
      seeker_id: user.id,
      cover_letter: coverLetter || null,
    });
    if (error) {
      toast({ title: t("auth.error"), description: error.message, variant: "destructive" });
    } else {
      setHasApplied(true);
      setShowApplyForm(false);
      toast({ title: t("jobs.applicationSent") });
    }
    setApplying(false);
  };

  if (!job) return <Layout><div className="container mx-auto px-4 py-12 text-center text-muted-foreground">{t("jobs.loading")}</div></Layout>;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> {t("jobs.back")}
        </button>

        <div className="bg-card border border-border rounded-xl p-8">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
            <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{jobTypeLabels[job.job_type]?.[language]}</span>
            {job.experience_level && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{experienceLabels[job.experience_level]?.[language]}</span>}
            {(job.salary_min || job.salary_max) && (
              <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{job.salary_min && `$${job.salary_min.toLocaleString()}`}{job.salary_min && job.salary_max && " - "}{job.salary_max && `$${job.salary_max.toLocaleString()}`}</span>
            )}
            {job.deadline && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{t("jobs.deadline")}: {new Date(job.deadline).toLocaleDateString()}</span>}
          </div>

          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {job.skills.map((s) => (
                <span key={s} className="bg-secondary text-secondary-foreground text-sm px-3 py-1 rounded-full">{s}</span>
              ))}
            </div>
          )}

          <div className="prose max-w-none mb-8">
            <h3 className="font-heading font-bold text-foreground">{t("jobs.description")}</h3>
            <p className="text-foreground/80 whitespace-pre-wrap">{job.description}</p>
          </div>

          {/* Apply section */}
          {user && role === "job_seeker" && !hasApplied && !showApplyForm && (
            <Button onClick={() => setShowApplyForm(true)} className="rounded-full bg-accent hover:bg-orange-hover text-accent-foreground font-heading font-bold">
              <Send className="w-4 h-4 mr-2" /> {t("jobs.applyNow")}
            </Button>
          )}
          {hasApplied && (
            <div className="bg-secondary rounded-lg p-4 text-center text-secondary-foreground font-heading font-semibold">
              ✓ {t("jobs.alreadyApplied")}
            </div>
          )}
          {showApplyForm && (
            <div className="border-t border-border pt-6 mt-6">
              <h3 className="font-heading font-bold text-foreground mb-4">{t("jobs.applyNow")}</h3>
              <Textarea
                placeholder={t("jobs.coverLetterPlaceholder")}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={5}
                className="mb-4"
                maxLength={2000}
              />
              <div className="flex gap-3">
                <Button onClick={handleApply} disabled={applying} className="rounded-full bg-accent hover:bg-orange-hover text-accent-foreground font-heading font-bold">
                  {applying ? "..." : t("jobs.submitApplication")}
                </Button>
                <Button variant="outline" onClick={() => setShowApplyForm(false)} className="rounded-full">
                  {t("jobs.cancel")}
                </Button>
              </div>
            </div>
          )}
          {!user && (
            <Button onClick={() => navigate("/auth")} className="rounded-full bg-accent hover:bg-orange-hover text-accent-foreground font-heading font-bold">
              {t("jobs.loginToApply")}
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default JobDetail;
