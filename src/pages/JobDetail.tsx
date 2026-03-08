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

type JobPosting = Database["public"]["Tables"]["job_postings"]["Row"];

const JobDetail = () => {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [showApply, setShowApply] = useState(false);

  const applicationSchema = z.object({
    first_name: z.string().trim().min(1, t("contact.fieldRequired")).max(50),
    last_name: z.string().trim().min(1, t("contact.fieldRequired")).max(50),
    email: z.string().trim().email(t("contact.invalidEmail")).max(255),
    phone: z.string().trim().min(1, t("contact.fieldRequired")).max(20),
    city: z.string().trim().max(100).optional().or(z.literal("")),
    linkedin_url: z.string().trim().max(500).optional().or(z.literal("")),
    cover_letter: z.string().trim().max(2000).optional().or(z.literal("")),
  });

  type ApplicationForm = z.infer<typeof applicationSchema>;

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
  });

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

  const uploadCV = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${id}/${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("candidate-cvs")
      .upload(fileName, file, { upsert: false });
    if (error) {
      console.error("CV upload error:", error);
      return null;
    }
    const { data: urlData } = supabase.storage.from("candidate-cvs").getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const onSubmit = async (data: ApplicationForm) => {
    if (!id) return;
    setUploading(true);

    let cvUrl: string | null = null;
    if (cvFile) {
      cvUrl = await uploadCV(cvFile);
      if (!cvUrl) {
        toast({ title: t("contact.errorTitle"), description: "CV upload failed", variant: "destructive" });
        setUploading(false);
        return;
      }
    }

    const { error } = await supabase.from("job_submissions").insert({
      job_id: id,
      full_name: `${data.first_name} ${data.last_name}`,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone || null,
      city: data.city || null,
      linkedin_url: data.linkedin_url || null,
      cover_letter: data.cover_letter || null,
      resume_url: cvUrl,
    });

    setUploading(false);

    if (error) {
      toast({ title: t("contact.errorTitle"), description: t("contact.errorDesc"), variant: "destructive" });
    } else {
      setSubmitted(true);
      reset();
      setCvFile(null);
      // Send notification email (fire-and-forget)
      supabase.functions.invoke("notify-submission", {
        body: { type: "job_application", data: { full_name: `${data.first_name} ${data.last_name}`, email: data.email, phone: data.phone, city: data.city, cover_letter: data.cover_letter, resume_url: cvUrl, job_title: job?.title } },
      }).catch(() => {});
    }
  };

  const formLabels = {
    en: {
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone",
      city: "City",
      linkedin: "LinkedIn Profile (optional)",
      cv: "Resume / CV",
      cvHelper: "PDF, DOC or DOCX (max 5MB)",
      coverLetter: "Cover Letter (optional)",
      coverLetterHelper: "Tell us why you're a great fit for this role",
      submit: "Submit Application",
      submitting: "Submitting...",
      browseFiles: "Browse Files",
      dragDrop: "or drag and drop your file here",
      fileSelected: "File selected",
      applyTitle: "Apply for this position",
      applySubtitle: "Fill out the form below and we'll get back to you",
    },
    fr: {
      firstName: "Prénom",
      lastName: "Nom",
      email: "Courriel",
      phone: "Téléphone",
      city: "Ville",
      linkedin: "Profil LinkedIn (optionnel)",
      cv: "CV / Curriculum vitae",
      cvHelper: "PDF, DOC ou DOCX (max 5 Mo)",
      coverLetter: "Lettre de motivation (optionnel)",
      coverLetterHelper: "Dites-nous pourquoi vous êtes le candidat idéal",
      submit: "Soumettre ma candidature",
      submitting: "Envoi en cours...",
      browseFiles: "Parcourir",
      dragDrop: "ou glissez-déposez votre fichier ici",
      fileSelected: "Fichier sélectionné",
      applyTitle: "Postuler pour ce poste",
      applySubtitle: "Remplissez le formulaire ci-dessous et nous vous contacterons",
    },
  };

  const labels = formLabels[language];

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
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">{job.title}</h1>
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

        {/* Application Form Card */}
        <div className="bg-card border-2 border-accent/20 rounded-xl p-8" id="apply">
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-foreground mb-3">{t("jobs.applicationSent")}</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">{t("jobs.applicationConfirm")}</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate("/jobs")} variant="outline" className="rounded-full">
                  <ArrowLeft className="w-4 h-4 mr-2" /> {t("jobs.back")}
                </Button>
                <Button onClick={() => setSubmitted(false)} className="rounded-full bg-accent hover:bg-orange-hover text-accent-foreground">
                  {t("jobs.applyAgain")}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-1">{labels.applyTitle}</h3>
                <p className="text-muted-foreground text-sm">{labels.applySubtitle}</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Name Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="first_name" className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      {labels.firstName} <span className="text-destructive">*</span>
                    </Label>
                    <Input id="first_name" placeholder={labels.firstName} {...register("first_name")} className="h-11" />
                    {errors.first_name && <p className="text-destructive text-xs">{errors.first_name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="last_name" className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      {labels.lastName} <span className="text-destructive">*</span>
                    </Label>
                    <Input id="last_name" placeholder={labels.lastName} {...register("last_name")} className="h-11" />
                    {errors.last_name && <p className="text-destructive text-xs">{errors.last_name.message}</p>}
                  </div>
                </div>

                {/* Email & Phone Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                      {labels.email} <span className="text-destructive">*</span>
                    </Label>
                    <Input id="email" type="email" placeholder="nom@exemple.com" {...register("email")} className="h-11" />
                    {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      {labels.phone} <span className="text-destructive">*</span>
                    </Label>
                    <Input id="phone" type="tel" placeholder="(514) 555-0123" {...register("phone")} className="h-11" />
                    {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
                  </div>
                </div>

                {/* City & LinkedIn Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-muted-foreground" />
                      {labels.city}
                    </Label>
                    <Input id="city" placeholder="Montréal" {...register("city")} className="h-11" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="linkedin_url" className="flex items-center gap-1.5">
                      <Linkedin className="w-3.5 h-3.5 text-muted-foreground" />
                      {labels.linkedin}
                    </Label>
                    <Input id="linkedin_url" placeholder="linkedin.com/in/votre-profil" {...register("linkedin_url")} className="h-11" />
                  </div>
                </div>

                {/* CV Upload */}
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    {labels.cv}
                  </Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file) setCvFile(file);
                    }}
                    className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setCvFile(file);
                      }}
                    />
                    {cvFile ? (
                      <div className="flex items-center justify-center gap-2 text-accent">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">{cvFile.name}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setCvFile(null); }}
                          className="text-muted-foreground hover:text-destructive ml-2 text-xs underline"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm">
                          <span className="text-accent font-medium">{labels.browseFiles}</span>{" "}
                          <span className="text-muted-foreground">{labels.dragDrop}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{labels.cvHelper}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Cover Letter */}
                <div className="space-y-1.5">
                  <Label htmlFor="cover_letter" className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    {labels.coverLetter}
                  </Label>
                  <Textarea
                    id="cover_letter"
                    placeholder={labels.coverLetterHelper}
                    rows={5}
                    maxLength={2000}
                    {...register("cover_letter")}
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isSubmitting || uploading}
                  className="w-full h-12 rounded-full bg-accent hover:bg-orange-hover text-accent-foreground font-heading font-bold text-base"
                >
                  {isSubmitting || uploading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                      {labels.submitting}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      {labels.submit}
                    </span>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default JobDetail;
