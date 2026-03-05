import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Clock, DollarSign, Briefcase, Calendar, ArrowLeft, Send, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  const { toast } = useToast();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobPosting | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const applicationSchema = z.object({
    full_name: z.string().trim().min(1, t("contact.fieldRequired")).max(100),
    email: z.string().trim().email(t("contact.invalidEmail")).max(255),
    phone: z.string().trim().max(20).optional().or(z.literal("")),
    cover_letter: z.string().trim().max(2000).optional().or(z.literal("")),
  });

  type ApplicationForm = z.infer<typeof applicationSchema>;

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
  });

  useEffect(() => {
    if (id) {
      supabase.from("job_postings").select("*").eq("id", id).single().then(({ data }) => setJob(data));
    }
  }, [id]);

  const onSubmit = async (data: ApplicationForm) => {
    if (!id) return;
    const { error } = await supabase.from("job_submissions").insert({
      job_id: id,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone || null,
      cover_letter: data.cover_letter || null,
    });
    if (error) {
      toast({ title: t("contact.errorTitle"), description: t("contact.errorDesc"), variant: "destructive" });
    } else {
      setSubmitted(true);
      reset();
    }
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

          {/* Direct Application Form */}
          <div className="border-t border-border pt-6 mt-6">
            <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-accent" /> {t("jobs.applyNow")}
            </h3>

            {submitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
                <h4 className="text-xl font-heading font-bold text-foreground mb-2">{t("jobs.applicationSent")}</h4>
                <p className="text-muted-foreground mb-6">{t("jobs.applicationConfirm")}</p>
                <Button onClick={() => setSubmitted(false)} variant="outline" className="rounded-full">
                  {t("jobs.applyAgain")}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">{t("contact.name")} *</Label>
                    <Input id="full_name" placeholder={t("contact.namePlaceholder")} {...register("full_name")} />
                    {errors.full_name && <p className="text-destructive text-sm mt-1">{errors.full_name.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email">{t("contact.email")} *</Label>
                    <Input id="email" type="email" placeholder={t("contact.emailPlaceholder")} {...register("email")} />
                    {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">{t("contact.phone")}</Label>
                  <Input id="phone" placeholder={t("contact.phonePlaceholder")} {...register("phone")} />
                </div>
                <div>
                  <Label htmlFor="cover_letter">{t("jobs.coverLetterPlaceholder")}</Label>
                  <Textarea id="cover_letter" placeholder={t("jobs.coverLetterPlaceholder")} rows={5} maxLength={2000} {...register("cover_letter")} />
                </div>
                <Button type="submit" disabled={isSubmitting} className="rounded-full bg-accent hover:bg-orange-hover text-accent-foreground font-heading font-bold">
                  {isSubmitting ? "..." : t("jobs.submitApplication")}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default JobDetail;
