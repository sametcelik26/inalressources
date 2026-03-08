import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { X, Send, CheckCircle, Upload, User, Mail, Phone, FileText, Linkedin, Building } from "lucide-react";
import { z } from "zod";
import { useRateLimit } from "@/hooks/useRateLimit";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface JobApplicationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
}

const JobApplicationOverlay = ({ isOpen, onClose, jobId, jobTitle }: JobApplicationOverlayProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [animating, setAnimating] = useState(false);
  const { checkLimit, recordSubmission } = useRateLimit({ key: "job_application", cooldownSeconds: 30, maxSubmissions: 5, windowSeconds: 3600 });

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

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setAnimating(true);
      requestAnimationFrame(() => setAnimating(false));
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  }, [onClose]);

  const uploadCV = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${jobId}/${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from("candidate-cvs")
      .upload(fileName, file, { upsert: false });
    if (error) { console.error("CV upload error:", error); return null; }
    const { data: urlData } = supabase.storage.from("candidate-cvs").getPublicUrl(data.path);
    return urlData.publicUrl;
  };

  const onSubmit = async (data: ApplicationForm) => {
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
      job_id: jobId,
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
      supabase.functions.invoke("notify-submission", {
        body: { type: "job_application", data: { full_name: `${data.first_name} ${data.last_name}`, email: data.email, phone: data.phone, city: data.city, cover_letter: data.cover_letter, resume_url: cvUrl, job_title: jobTitle } },
      }).catch(() => {});
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    reset();
    setCvFile(null);
    onClose();
  };

  const formLabels = {
    en: {
      firstName: "First Name", lastName: "Last Name", email: "Email", phone: "Phone",
      city: "City", linkedin: "LinkedIn Profile (optional)",
      cv: "Resume / CV", cvHelper: "PDF, DOC or DOCX (max 5MB)",
      coverLetter: "Cover Letter (optional)", coverLetterHelper: "Tell us why you're a great fit for this role",
      submit: "Submit Application", submitting: "Submitting...",
      browseFiles: "Browse Files", dragDrop: "or drag and drop your file here",
      applyTitle: "Apply for This Position", applySubtitle: "Fill out the form below and we'll get back to you",
      successTitle: "Application Submitted!", successDesc: "Thank you for your application. We will contact you soon.",
      close: "Close",
    },
    fr: {
      firstName: "Prénom", lastName: "Nom", email: "Courriel", phone: "Téléphone",
      city: "Ville", linkedin: "Profil LinkedIn (optionnel)",
      cv: "CV / Curriculum vitae", cvHelper: "PDF, DOC ou DOCX (max 5 Mo)",
      coverLetter: "Lettre de motivation (optionnel)", coverLetterHelper: "Dites-nous pourquoi vous êtes le candidat idéal",
      submit: "Soumettre ma candidature", submitting: "Envoi en cours...",
      browseFiles: "Parcourir", dragDrop: "ou glissez-déposez votre fichier ici",
      applyTitle: "Postuler pour ce poste", applySubtitle: "Remplissez le formulaire ci-dessous et nous vous contacterons",
      successTitle: "Candidature soumise!", successDesc: "Merci pour votre candidature. Nous vous contacterons bientôt.",
      close: "Fermer",
    },
  };

  const labels = formLabels[language];

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={labels.applyTitle}
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${animating ? "opacity-0" : "opacity-100"}`}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`relative z-10 bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl transition-all duration-400 ease-out ${
          animating
            ? "opacity-0 translate-y-8 scale-95"
            : "opacity-100 translate-y-0 scale-100"
        }`}
        style={{ scrollbarWidth: "thin" }}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-secondary hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
          aria-label={labels.close}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
                <CheckCircle className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-foreground mb-3">{labels.successTitle}</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">{labels.successDesc}</p>
              <p className="text-sm text-muted-foreground mb-8 italic">"{jobTitle}"</p>
              <Button onClick={handleClose} className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground px-8">
                {labels.close}
              </Button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="text-center mb-6 pr-8">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Send className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl md:text-2xl font-heading font-bold text-foreground mb-1">{labels.applyTitle}</h3>
                <p className="text-muted-foreground text-sm">{labels.applySubtitle}</p>
                <p className="text-accent font-medium text-sm mt-1">"{jobTitle}"</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="overlay_first_name" className="flex items-center gap-1.5 text-sm">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      {labels.firstName} <span className="text-destructive">*</span>
                    </Label>
                    <Input id="overlay_first_name" placeholder={labels.firstName} {...register("first_name")} className="h-10" />
                    {errors.first_name && <p className="text-destructive text-xs">{errors.first_name.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="overlay_last_name" className="flex items-center gap-1.5 text-sm">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      {labels.lastName} <span className="text-destructive">*</span>
                    </Label>
                    <Input id="overlay_last_name" placeholder={labels.lastName} {...register("last_name")} className="h-10" />
                    {errors.last_name && <p className="text-destructive text-xs">{errors.last_name.message}</p>}
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="overlay_email" className="flex items-center gap-1.5 text-sm">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                      {labels.email} <span className="text-destructive">*</span>
                    </Label>
                    <Input id="overlay_email" type="email" placeholder="nom@exemple.com" {...register("email")} className="h-10" />
                    {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="overlay_phone" className="flex items-center gap-1.5 text-sm">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      {labels.phone} <span className="text-destructive">*</span>
                    </Label>
                    <Input id="overlay_phone" type="tel" placeholder="(514) 555-0123" {...register("phone")} className="h-10" />
                    {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
                  </div>
                </div>

                {/* City & LinkedIn */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="overlay_city" className="flex items-center gap-1.5 text-sm">
                      <Building className="w-3.5 h-3.5 text-muted-foreground" />
                      {labels.city}
                    </Label>
                    <Input id="overlay_city" placeholder="Montréal" {...register("city")} className="h-10" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="overlay_linkedin" className="flex items-center gap-1.5 text-sm">
                      <Linkedin className="w-3.5 h-3.5 text-muted-foreground" />
                      {labels.linkedin}
                    </Label>
                    <Input id="overlay_linkedin" placeholder="linkedin.com/in/profile" {...register("linkedin_url")} className="h-10" />
                  </div>
                </div>

                {/* CV Upload */}
                <div className="space-y-1">
                  <Label className="flex items-center gap-1.5 text-sm">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    {labels.cv}
                  </Label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                    onDrop={(e) => {
                      e.preventDefault(); e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file) setCvFile(file);
                    }}
                    className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => { const file = e.target.files?.[0]; if (file) setCvFile(file); }}
                    />
                    {cvFile ? (
                      <div className="flex items-center justify-center gap-2 text-accent">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium text-sm">{cvFile.name}</span>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setCvFile(null); }} className="text-muted-foreground hover:text-destructive ml-1 text-xs underline">✕</button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-1" />
                        <p className="text-sm">
                          <span className="text-accent font-medium">{labels.browseFiles}</span>{" "}
                          <span className="text-muted-foreground">{labels.dragDrop}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">{labels.cvHelper}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Cover Letter */}
                <div className="space-y-1">
                  <Label htmlFor="overlay_cover" className="flex items-center gap-1.5 text-sm">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    {labels.coverLetter}
                  </Label>
                  <Textarea id="overlay_cover" placeholder={labels.coverLetterHelper} rows={3} maxLength={2000} {...register("cover_letter")} />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isSubmitting || uploading}
                  className="w-full h-11 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-heading font-bold text-base"
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
    </div>
  );
};

export default JobApplicationOverlay;
