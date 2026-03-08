import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { industries, licenseClasses, workLocations } from "@/lib/constants";
import { User, Phone, Mail, Clock, Car, Factory, MapPin, Shield, Upload, MessageSquare, CheckCircle, Send, X, Plus, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useRateLimit } from "@/hooks/useRateLimit";
import { validateCVFile, FILE_VALIDATION_MESSAGES, getTotalSize, formatFileSize, CV_MAX_TOTAL } from "@/lib/fileValidation";

const CandidateForm = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { checkLimit, recordSubmission } = useRateLimit({ key: "candidate", cooldownSeconds: 60, maxSubmissions: 3, windowSeconds: 3600 });
  const [cvFiles, setCvFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSize = getTotalSize(cvFiles);
  const canAddMore = totalSize < CV_MAX_TOTAL;

  const addFile = (file: File) => {
    const result = validateCVFile(file, totalSize);
    if (!result.valid) {
      const msgs = FILE_VALIDATION_MESSAGES[language];
      toast({ title: t("candidate.errorTitle"), description: msgs[result.errorKey!], variant: "destructive" });
      return false;
    }
    setCvFiles(prev => [...prev, file]);
    return true;
  };

  const removeFile = (index: number) => {
    setCvFiles(prev => prev.filter((_, i) => i !== index));
  };

  const candidateSchema = z.object({
    full_name: z.string().trim().max(200).optional().or(z.literal("")),
    phone: z.string().trim().min(1, t("common.required")).max(30),
    email: z.string().trim().email(t("common.invalidEmail")).max(255),
    availability: z.array(z.string()).min(1, t("common.required")),
    license_class: z.string().min(1, t("common.required")),
    industries: z.array(z.string()).min(1, t("common.required")),
    work_locations: z.array(z.string()).min(1, t("common.required")),
    legal_right_to_work: z.string().optional(),
    preferred_contact: z.string().min(1, t("common.required")),
    comments: z.string().trim().max(2000).optional().or(z.literal("")),
  });

  type CandidateFormValues = z.infer<typeof candidateSchema>;

  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      full_name: "", phone: "", email: "",
      availability: [],
      license_class: "",
      industries: [],
      work_locations: [],
      legal_right_to_work: "no", preferred_contact: "either", comments: "",
    },
  });

  const availabilityOptions = [
    { value: "full_time", label: t("candidate.fullTime") },
    { value: "part_time", label: t("candidate.partTime") },
    { value: "temporary", label: t("candidate.temporary") },
  ];

  const onSubmit = async (data: CandidateFormValues) => {
    if (!checkLimit()) {
      toast({ title: t("candidate.errorTitle"), description: t("common.rateLimitedGeneric"), variant: "destructive" });
      return;
    }
    setLoading(true);
    let cv_url: string | null = null;

    if (cvFiles.length > 0) {
      const uploadedPaths: string[] = [];
      for (const file of cvFiles) {
        const ext = file.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("candidate-cvs").upload(path, file);
        if (uploadError) {
          toast({ title: t("candidate.errorTitle"), description: t("candidate.uploadError"), variant: "destructive" });
          setLoading(false);
          return;
        }
        uploadedPaths.push(path);
      }
      cv_url = uploadedPaths.join(",");
    }

    const { error } = await supabase.from("candidate_applications").insert({
      full_name: data.full_name || "N/A",
      phone: data.phone,
      email: data.email,
      availability: data.availability.join(", "),
      license_class: data.license_class,
      industry: data.industries.join(", "),
      work_location: data.work_locations.join(", "),
      legal_right_to_work: data.legal_right_to_work === "yes",
      cv_url,
      preferred_contact: data.preferred_contact,
      comments: data.comments || null,
    });
    setLoading(false);
    if (error) {
      toast({ title: t("candidate.errorTitle"), description: t("candidate.errorDesc"), variant: "destructive" });
    } else {
      recordSubmission();
      setSubmitted(true);
      supabase.functions.invoke("notify-submission", {
        body: { type: "candidate_registration", data: { full_name: data.full_name || "N/A", email: data.email, phone: data.phone, availability: data.availability.join(", "), industry: data.industries.join(", "), work_location: data.work_locations.join(", "), license_class: data.license_class, comments: data.comments } },
      }).catch(() => {});
    }
  };

  if (submitted) {
    return (
      <Layout mainClassName="bg-secondary">
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="bg-card rounded-2xl shadow-xl p-10 max-w-lg w-full text-center">
            <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">{t("candidate.successTitle")}</h2>
            <p className="text-muted-foreground mb-6">{t("candidate.successDesc")}</p>
            <Button
              onClick={() => { setSubmitted(false); form.reset(); setCvFiles([]); }}
              className="bg-accent hover:bg-orange-hover text-accent-foreground font-heading font-bold rounded-full px-8"
            >
              {t("candidate.submitAnother")}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout mainClassName="bg-secondary">
      <div className="px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-card rounded-2xl shadow-xl p-8 md:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                <User className="w-6 h-6 text-accent-foreground" />
              </div>
              <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground">{t("candidate.formTitle")}</h1>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField control={form.control} name="full_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><User className="w-4 h-4 text-accent" />{t("candidate.fullName")}</FormLabel>
                    <FormControl><Input placeholder={t("candidate.fullNamePh")} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Phone className="w-4 h-4 text-accent" />{t("candidate.phone")} *</FormLabel>
                      <FormControl><Input placeholder="+1 (438) 000-0000" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2"><Mail className="w-4 h-4 text-accent" />{t("candidate.email")} *</FormLabel>
                      <FormControl><Input type="email" placeholder="you@email.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {/* Availability - Multi-select checkboxes */}
                <FormField control={form.control} name="availability" render={() => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Clock className="w-4 h-4 text-accent" />{t("candidate.availability")} *</FormLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      {availabilityOptions.map((option) => (
                        <FormField
                          key={option.value}
                          control={form.control}
                          name="availability"
                          render={({ field }) => (
                            <div className="flex items-center gap-2 rounded-lg border border-border p-3 hover:border-accent transition-colors">
                              <Checkbox
                                checked={field.value?.includes(option.value)}
                                onCheckedChange={(checked) => {
                                  const updated = checked
                                    ? [...(field.value || []), option.value]
                                    : (field.value || []).filter((v: string) => v !== option.value);
                                  field.onChange(updated);
                                }}
                              />
                              <Label className="cursor-pointer text-sm">{option.label}</Label>
                            </div>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="license_class" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Car className="w-4 h-4 text-accent" />{t("candidate.licenseClass")} *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder={t("candidate.licenseClassPh")} /></SelectTrigger></FormControl>
                      <SelectContent>{licenseClasses.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Industry - Multi-select checkboxes */}
                <FormField control={form.control} name="industries" render={() => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Factory className="w-4 h-4 text-accent" />{t("candidate.industry")} *</FormLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-64 overflow-y-auto border border-border rounded-lg p-3">
                      {industries.map((industry) => (
                        <FormField
                          key={industry}
                          control={form.control}
                          name="industries"
                          render={({ field }) => (
                            <div className="flex items-center gap-2 py-1">
                              <Checkbox
                                checked={field.value?.includes(industry)}
                                onCheckedChange={(checked) => {
                                  const updated = checked
                                    ? [...(field.value || []), industry]
                                    : (field.value || []).filter((v: string) => v !== industry);
                                  field.onChange(updated);
                                }}
                              />
                              <Label className="cursor-pointer text-sm">{industry}</Label>
                            </div>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* Work Location - Multi-select checkboxes */}
                <FormField control={form.control} name="work_locations" render={() => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><MapPin className="w-4 h-4 text-accent" />{t("candidate.workLocation")} *</FormLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 max-h-64 overflow-y-auto border border-border rounded-lg p-3">
                      {workLocations.map((loc) => (
                        <FormField
                          key={loc}
                          control={form.control}
                          name="work_locations"
                          render={({ field }) => (
                            <div className="flex items-center gap-2 py-1">
                              <Checkbox
                                checked={field.value?.includes(loc)}
                                onCheckedChange={(checked) => {
                                  const updated = checked
                                    ? [...(field.value || []), loc]
                                    : (field.value || []).filter((v: string) => v !== loc);
                                  field.onChange(updated);
                                }}
                              />
                              <Label className="cursor-pointer text-sm">{loc}</Label>
                            </div>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="legal_right_to_work" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Shield className="w-4 h-4 text-accent" />{t("candidate.legalRight")}</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-6 pt-1">
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="yes" id="legal-yes" />
                          <Label htmlFor="legal-yes">{t("candidate.yes")}</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="no" id="legal-no" />
                          <Label htmlFor="legal-no">{t("candidate.no")}</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <Upload className="w-4 h-4 text-accent" />{t("candidate.uploadCv")}
                  </label>

                  {/* File list */}
                  {cvFiles.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {cvFiles.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-accent shrink-0" />
                            <span className="text-sm font-medium truncate">{file.name}</span>
                            <span className="text-xs text-muted-foreground shrink-0">({formatFileSize(file.size)})</span>
                          </div>
                          <button type="button" onClick={() => removeFile(index)} className="text-muted-foreground hover:text-destructive ml-2 shrink-0">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground">
                        {language === 'fr' ? 'Total' : 'Total'}: {formatFileSize(totalSize)} / 5 MB
                      </p>
                    </div>
                  )}

                  {/* Drop zone - show when no files or can add more */}
                  {cvFiles.length === 0 && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      onDrop={(e) => {
                        e.preventDefault(); e.stopPropagation();
                        const file = e.dataTransfer.files?.[0];
                        if (file) addFile(file);
                      }}
                      className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-colors"
                    >
                      <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm">
                        <span className="text-accent font-medium">{t("candidate.browseFiles")}</span>{" "}
                        <span className="text-muted-foreground">{t("candidate.dragDrop")}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{t("candidate.cvHelper")}</p>
                    </div>
                  )}

                  {/* Add more button */}
                  {cvFiles.length > 0 && canAddMore && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      {language === 'fr' ? 'Ajouter un autre fichier' : 'Add another file'}
                    </Button>
                  )}

                  {/* Total size warning */}
                  {cvFiles.length > 0 && !canAddMore && (
                    <p className="text-xs text-destructive mt-2">
                      {language === 'fr' ? 'La taille totale des fichiers est au maximum de 5 Mo.' : 'Total file size must not exceed 5 MB.'}
                    </p>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) addFile(file);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  />
                </div>

                <FormField control={form.control} name="preferred_contact" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-accent" />{t("candidate.preferredContact")} *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="phone">{t("candidate.contactPhone")}</SelectItem>
                        <SelectItem value="email">{t("candidate.contactEmail")}</SelectItem>
                        <SelectItem value="either">{t("candidate.contactEither")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="comments" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-accent" />{t("candidate.comments")}</FormLabel>
                    <FormControl><Textarea rows={4} placeholder={t("candidate.commentsPh")} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-orange-hover text-accent-foreground font-heading font-bold text-base rounded-full py-6 shadow-lg hover:shadow-xl transition-all duration-200">
                  <Send className="w-5 h-5 mr-2" />
                  {loading ? t("common.loading") : t("candidate.submit")}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CandidateForm;
