import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, DollarSign, Briefcase, Calendar, ArrowLeft, Send, AlertCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { useState } from "react";
import { jobTypeLabels, experienceLabels } from "@/lib/constants";
import type { Database } from "@/integrations/supabase/types";
import JobApplicationOverlay from "@/components/JobApplicationOverlay";
import { getJobTitle, getJobDescription, getBilingualField } from "@/lib/bilingual";

type JobPosting = Database["public"]["Tables"]["job_postings"]["Row"];

const JobDetail = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [showApply, setShowApply] = useState(false);

  const { data: job, isLoading, isError } = useQuery<JobPosting | null>({
    queryKey: ["job", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("job_postings")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });


  if (isError) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="font-heading font-bold text-lg text-foreground mb-2">{t("jobs.errorTitle")}</p>
          <p className="text-muted-foreground mb-6">{t("jobs.errorDesc")}</p>
          <Button onClick={() => navigate("/jobs")} variant="outline" className="rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" /> {t("jobs.back")}
          </Button>
        </div>
      </Layout>
    );
  }

  if (isLoading || !job) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl animate-pulse">
          <div className="h-4 bg-muted rounded w-20 mb-6" />
          <div className="bg-card border border-border rounded-xl p-8">
            <div className="h-8 bg-muted rounded w-2/3 mb-4" />
            <div className="flex gap-4 mb-6">
              <div className="h-4 bg-muted rounded w-24" />
              <div className="h-4 bg-muted rounded w-20" />
            </div>
            <div className="h-4 bg-muted rounded w-full mb-2" />
            <div className="h-4 bg-muted rounded w-5/6 mb-2" />
            <div className="h-4 bg-muted rounded w-4/6" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t("jobs.back")}
        </button>

        {/* Job Details Card */}
        <div className="bg-card border border-border rounded-xl p-8 mb-8">
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">{getJobTitle(job, language)}</h1>
          {(job as any).company_name && (
            <p className="text-lg text-muted-foreground mb-4 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4" /> {(job as any).company_name}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
            <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{jobTypeLabels[job.job_type]?.[language]}</span>
            {job.experience_level && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{experienceLabels[job.experience_level]?.[language]}</span>}
            {(job.salary_min || job.salary_max) && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {job.salary_min && `$${job.salary_min.toLocaleString()}`}
                {job.salary_min && job.salary_max && " - "}
                {job.salary_max && `$${job.salary_max.toLocaleString()}`}
              </span>
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

          <div className="prose max-w-none">
            <h3 className="font-heading font-bold text-foreground">{t("jobs.description")}</h3>
            <p className="text-foreground/80 whitespace-pre-wrap">{job.description}</p>
          </div>

          {(job as any).responsibilities && (
            <div className="prose max-w-none mt-6">
              <h3 className="font-heading font-bold text-foreground">{t("jobs.responsibilities")}</h3>
              <p className="text-foreground/80 whitespace-pre-wrap">{(job as any).responsibilities}</p>
            </div>
          )}

          {(job as any).skills_required && (
            <div className="prose max-w-none mt-6">
              <h3 className="font-heading font-bold text-foreground">{t("jobs.skillsRequired")}</h3>
              <p className="text-foreground/80 whitespace-pre-wrap">{(job as any).skills_required}</p>
            </div>
          )}

          {(job as any).conditions && (
            <div className="prose max-w-none mt-6">
              <h3 className="font-heading font-bold text-foreground">{t("jobs.conditions")}</h3>
              <p className="text-foreground/80 whitespace-pre-wrap">{(job as any).conditions}</p>
            </div>
          )}

          {(job as any).benefits && (
            <div className="prose max-w-none mt-6">
              <h3 className="font-heading font-bold text-foreground">{t("jobs.benefits")}</h3>
              <p className="text-foreground/80 whitespace-pre-wrap">{(job as any).benefits}</p>
            </div>
          )}

          {(job as any).requirements && (
            <div className="prose max-w-none mt-6">
              <h3 className="font-heading font-bold text-foreground">{language === "fr" ? "Exigences" : "Requirements"}</h3>
              <p className="text-foreground/80 whitespace-pre-wrap">{(job as any).requirements}</p>
            </div>
          )}

          {(job as any).application_email && (
            <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {language === "fr" ? "Vous pouvez aussi postuler par courriel:" : "You can also apply via email:"}{" "}
                <a href={`mailto:${(job as any).application_email}`} className="text-primary font-medium hover:underline">
                  {(job as any).application_email}
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Apply Now Button */}
        <div className="text-center">
          <Button
            onClick={() => setShowApply(true)}
            className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-heading font-bold text-lg px-12 py-6"
          >
            <Send className="w-5 h-5 mr-2" />
            {t("jobs.applyNow")}
          </Button>
        </div>
      </div>

      {/* Application Overlay */}
      <JobApplicationOverlay
        isOpen={showApply}
        onClose={() => setShowApply(false)}
        jobId={id || ""}
        jobTitle={job.title}
      />
    </Layout>
  );
};

export default JobDetail;
