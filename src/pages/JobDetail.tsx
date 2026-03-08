import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, DollarSign, Briefcase, Calendar, ArrowLeft, Send, AlertCircle, Share2, Link2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useState, useMemo } from "react";
import { jobTypeLabels, experienceLabels } from "@/lib/constants";
import type { Database } from "@/integrations/supabase/types";
import JobApplicationOverlay from "@/components/JobApplicationOverlay";
import { getJobTitle, getJobDescription, getBilingualField } from "@/lib/bilingual";
import SEOHead from "@/components/SEOHead";

type JobPosting = Database["public"]["Tables"]["job_postings"]["Row"];

const JobDetail = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showApply, setShowApply] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

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

  const jobJsonLd = useMemo(() => {
    if (!job) return undefined;
    return {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": getJobTitle(job, language),
      "description": getJobDescription(job, language),
      "datePosted": job.created_at,
      "validThrough": job.deadline || undefined,
      "employmentType": job.job_type === "full_time" ? "FULL_TIME" : job.job_type === "part_time" ? "PART_TIME" : "CONTRACTOR",
      "hiringOrganization": {
        "@type": "Organization",
        "name": job.company_name || "INAL Ressources",
        "sameAs": "https://www.inalressources.info"
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": job.location,
          "addressCountry": "CA"
        }
      },
      ...(job.salary_min || job.salary_max ? {
        "baseSalary": {
          "@type": "MonetaryAmount",
          "currency": "CAD",
          "value": {
            "@type": "QuantitativeValue",
            "minValue": job.salary_min,
            "maxValue": job.salary_max,
            "unitText": "HOUR"
          }
        }
      } : {})
    };
  }, [job, language]);

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
      <SEOHead
        title={getJobTitle(job, language)}
        description={getJobDescription(job, language).substring(0, 155)}
        canonical={`https://www.inalressources.info/jobs/${id}`}
        ogType="article"
        jsonLd={jobJsonLd}
      />
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
            <p className="text-foreground/80 whitespace-pre-wrap">{getJobDescription(job, language)}</p>
          </div>

          {getBilingualField(job, "responsibilities", "responsibilities_fr", language) && (
            <div className="prose max-w-none mt-6">
              <h3 className="font-heading font-bold text-foreground">{t("jobs.responsibilities")}</h3>
              <p className="text-foreground/80 whitespace-pre-wrap">{getBilingualField(job, "responsibilities", "responsibilities_fr", language)}</p>
            </div>
          )}

          {getBilingualField(job, "skills_required", "skills_required_fr", language) && (
            <div className="prose max-w-none mt-6">
              <h3 className="font-heading font-bold text-foreground">{t("jobs.skillsRequired")}</h3>
              <p className="text-foreground/80 whitespace-pre-wrap">{getBilingualField(job, "skills_required", "skills_required_fr", language)}</p>
            </div>
          )}

          {getBilingualField(job, "conditions", "conditions_fr", language) && (
            <div className="prose max-w-none mt-6">
              <h3 className="font-heading font-bold text-foreground">{t("jobs.conditions")}</h3>
              <p className="text-foreground/80 whitespace-pre-wrap">{getBilingualField(job, "conditions", "conditions_fr", language)}</p>
            </div>
          )}

          {getBilingualField(job, "benefits", "benefits_fr", language) && (
            <div className="prose max-w-none mt-6">
              <h3 className="font-heading font-bold text-foreground">{t("jobs.benefits")}</h3>
              <p className="text-foreground/80 whitespace-pre-wrap">{getBilingualField(job, "benefits", "benefits_fr", language)}</p>
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

        {/* Share Section */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <h3 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            {t("jobs.shareJob")}
          </h3>
          <div className="flex flex-wrap gap-3">
            {/* LinkedIn */}
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://www.inalressources.info/jobs/${id}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#0077B5] hover:bg-[#006699] text-white rounded-full text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </a>

            {/* Facebook */}
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://www.inalressources.info/jobs/${id}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-full text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </a>

            {/* X (Twitter) */}
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://www.inalressources.info/jobs/${id}`)}&text=${encodeURIComponent(getJobTitle(job, language))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-foreground hover:bg-foreground/90 text-background rounded-full text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              X
            </a>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${getJobTitle(job, language)} - https://www.inalressources.info/jobs/${id}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              WhatsApp
            </a>

            {/* Email */}
            <a
              href={`mailto:?subject=${encodeURIComponent(getJobTitle(job, language))}&body=${encodeURIComponent(`${getJobTitle(job, language)}\n\nhttps://www.inalressources.info/jobs/${id}`)}`}
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Email
            </a>

            {/* Copy Link */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(`https://www.inalressources.info/jobs/${id}`);
                setLinkCopied(true);
                toast({ title: t("jobs.linkCopied") });
                setTimeout(() => setLinkCopied(false), 2000);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full text-sm font-medium transition-colors"
            >
              {linkCopied ? <Check className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4" />}
              {t("jobs.copyLink")}
            </button>
          </div>
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
