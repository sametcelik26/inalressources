import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { industries, workLocations } from "@/lib/constants";
import {
  Building2, User, MapPin, Phone, Mail, Briefcase, Factory, Users,
  MessageSquare, CheckCircle, Send, Calendar, Clock, FileText,
  Zap, ChevronRight, ChevronLeft, Hash
} from "lucide-react";
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

const EmployerForm = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { checkLimit, recordSubmission } = useRateLimit({ key: "employer", cooldownSeconds: 60, maxSubmissions: 3, windowSeconds: 3600 });
  const [step, setStep] = useState(1);

  const employerSchema = z.object({
    // Step 1: Company Info
    company_name: z.string().trim().min(1, t("common.required")).max(200),
    contact_person: z.string().trim().min(1, t("common.required")).max(200),
    company_address: z.string().trim().max(500).optional().or(z.literal("")),
    phone: z.string().trim().max(30).optional().or(z.literal("")),
    email: z.string().trim().email(t("common.invalidEmail")).max(255),
    industry: z.string().optional().or(z.literal("")),
    department: z.string().trim().max(200).optional().or(z.literal("")),
    // Step 2: Position Details
    job_title: z.string().trim().max(200).optional().or(z.literal("")),
    job_description: z.string().trim().max(5000).optional().or(z.literal("")),
    employees_needed: z.coerce.number().int().min(1).max(9999).optional().or(z.literal("")),
    work_schedule: z.array(z.string()).optional(),
    salary_range: z.string().optional().or(z.literal("")),
    required_skills: z.string().trim().max(2000).optional().or(z.literal("")),
    // Step 3: Timeline & Contact
    start_date: z.string().optional().or(z.literal("")),
    urgency: z.string().default("normal"),
    work_location: z.string().optional().or(z.literal("")),
    preferred_contact: z.string().default("either"),
    comments: z.string().trim().max(2000).optional().or(z.literal("")),
  });

  type EmployerFormValues = z.infer<typeof employerSchema>;

  const form = useForm<EmployerFormValues>({
    resolver: zodResolver(employerSchema),
    defaultValues: {
      company_name: "", contact_person: "", company_address: "",
      phone: "", email: "", industry: "", department: "",
      job_title: "", job_description: "", employees_needed: "",
      work_schedule: [], salary_range: "", required_skills: "",
      start_date: "", urgency: "normal", work_location: "",
      preferred_contact: "either", comments: "",
    },
  });

  const scheduleOptions = [
    { value: "day", label: t("employer.scheduleDay") },
    { value: "evening", label: t("employer.scheduleEvening") },
    { value: "night", label: t("employer.scheduleNight") },
    { value: "weekend", label: t("employer.scheduleWeekend") },
    { value: "rotating", label: t("employer.scheduleRotating") },
    { value: "flexible", label: t("employer.scheduleFlexible") },
  ];

  const onSubmit = async (data: EmployerFormValues) => {
    if (!checkLimit()) {
      toast({ title: t("employer.errorTitle"), description: t("common.rateLimitedGeneric"), variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("employer_requests").insert({
      company_name: data.company_name,
      contact_person: data.contact_person,
      company_address: data.company_address || null,
      phone: data.phone || null,
      email: data.email,
      job_title: data.job_title || null,
      industry: data.industry || null,
      employees_needed: typeof data.employees_needed === "number" ? data.employees_needed : null,
      preferred_contact: data.preferred_contact,
      comments: data.comments || null,
      job_description: data.job_description || null,
      work_schedule: data.work_schedule?.join(", ") || null,
      urgency: data.urgency,
      required_skills: data.required_skills || null,
      start_date: data.start_date || null,
      department: data.department || null,
      salary_range: data.salary_range || null,
    } as any);
    setLoading(false);
    if (error) {
      toast({ title: t("employer.errorTitle"), description: t("employer.errorDesc"), variant: "destructive" });
    } else {
      recordSubmission();
      setSubmitted(true);
      supabase.functions.invoke("notify-submission", {
        body: { type: "employer_request", data: { company_name: data.company_name, contact_person: data.contact_person, email: data.email, phone: data.phone, industry: data.industry, job_title: data.job_title, employees_needed: data.employees_needed, urgency: data.urgency, comments: data.comments } },
      }).catch(() => {});
    }
  };

  const validateStep = async (currentStep: number) => {
    let fieldsToValidate: (keyof EmployerFormValues)[] = [];
    if (currentStep === 1) {
      fieldsToValidate = ["company_name", "contact_person", "email"];
    }
    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const nextStep = async () => {
    const isValid = await validateStep(step);
    if (isValid) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  if (submitted) {
    return (
      <Layout mainClassName="bg-secondary">
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="bg-card rounded-2xl shadow-xl p-10 max-w-lg w-full text-center">
            <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">{t("employer.successTitle")}</h2>
            <p className="text-muted-foreground mb-6">{t("employer.successDesc")}</p>
            <Button
              onClick={() => { setSubmitted(false); form.reset(); setStep(1); }}
              className="bg-accent hover:bg-orange-hover text-accent-foreground font-heading font-bold rounded-full px-8"
            >
              {t("employer.submitAnother")}
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const stepLabels = [
    t("employer.step1"),
    t("employer.step2"),
    t("employer.step3"),
  ];

  return (
    <Layout mainClassName="bg-secondary">
      <div className="px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-2xl shadow-xl p-8 md:p-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground">{t("employer.formTitle")}</h1>
                <p className="text-sm text-muted-foreground">{t("employer.formSubtitle")}</p>
              </div>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    s <= step ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {s}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${s <= step ? "text-foreground" : "text-muted-foreground"}`}>
                    {stepLabels[s - 1]}
                  </span>
                  {s < 3 && <div className={`flex-1 h-0.5 ${s < step ? "bg-accent" : "bg-muted"}`} />}
                </div>
              ))}
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {/* ─── Step 1: Company Information ─── */}
                {step === 1 && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-right-5 duration-300">
                    <FormField control={form.control} name="company_name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Building2 className="w-4 h-4 text-accent" />{t("employer.companyName")} *</FormLabel>
                        <FormControl><Input placeholder={t("employer.companyNamePh")} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField control={form.control} name="contact_person" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><User className="w-4 h-4 text-accent" />{t("employer.contactPerson")} *</FormLabel>
                          <FormControl><Input placeholder={t("employer.contactPersonPh")} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="department" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Hash className="w-4 h-4 text-accent" />{t("employer.department")}</FormLabel>
                          <FormControl><Input placeholder={t("employer.departmentPh")} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="company_address" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><MapPin className="w-4 h-4 text-accent" />{t("employer.companyAddress")}</FormLabel>
                        <FormControl><Input placeholder={t("employer.companyAddressPh")} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Phone className="w-4 h-4 text-accent" />{t("employer.phone")}</FormLabel>
                          <FormControl><Input placeholder="+1 (438) 000-0000" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Mail className="w-4 h-4 text-accent" />{t("employer.email")} *</FormLabel>
                          <FormControl><Input type="email" placeholder="email@company.com" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="industry" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Factory className="w-4 h-4 text-accent" />{t("employer.industry")}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder={t("employer.industryPh")} /></SelectTrigger></FormControl>
                          <SelectContent>{industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                )}

                {/* ─── Step 2: Position Details ─── */}
                {step === 2 && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-right-5 duration-300">
                    <FormField control={form.control} name="job_title" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-accent" />{t("employer.jobTitle")}</FormLabel>
                        <FormControl><Input placeholder={t("employer.jobTitlePh")} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="job_description" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><FileText className="w-4 h-4 text-accent" />{t("employer.jobDescription")}</FormLabel>
                        <FormControl><Textarea rows={4} placeholder={t("employer.jobDescriptionPh")} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField control={form.control} name="employees_needed" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Users className="w-4 h-4 text-accent" />{t("employer.employeesNeeded")}</FormLabel>
                          <FormControl><Input type="number" min={1} placeholder="e.g. 5" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="salary_range" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">{t("employer.salaryRange")}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder={t("employer.salaryRangePh")} /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="15-20">$15 - $20/hr</SelectItem>
                              <SelectItem value="20-25">$20 - $25/hr</SelectItem>
                              <SelectItem value="25-30">$25 - $30/hr</SelectItem>
                              <SelectItem value="30-40">$30 - $40/hr</SelectItem>
                              <SelectItem value="40-50">$40 - $50/hr</SelectItem>
                              <SelectItem value="50+">$50+/hr</SelectItem>
                              <SelectItem value="negotiable">{t("employer.negotiable")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    {/* Work Schedule - Multi-select */}
                    <FormField control={form.control} name="work_schedule" render={() => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><Clock className="w-4 h-4 text-accent" />{t("employer.workSchedule")}</FormLabel>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                          {scheduleOptions.map((option) => (
                            <FormField
                              key={option.value}
                              control={form.control}
                              name="work_schedule"
                              render={({ field }) => (
                                <div className="flex items-center gap-2 rounded-lg border border-border p-3 hover:border-accent transition-colors">
                                  <Checkbox
                                    checked={field.value?.includes(option.value)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      const updated = checked
                                        ? [...current, option.value]
                                        : current.filter((v: string) => v !== option.value);
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

                    <FormField control={form.control} name="required_skills" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">{t("employer.requiredSkills")}</FormLabel>
                        <FormControl><Textarea rows={2} placeholder={t("employer.requiredSkillsPh")} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                )}

                {/* ─── Step 3: Timeline & Contact ─── */}
                {step === 3 && (
                  <div className="space-y-5 animate-in fade-in slide-in-from-right-5 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <FormField control={form.control} name="start_date" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Calendar className="w-4 h-4 text-accent" />{t("employer.startDate")}</FormLabel>
                          <FormControl><Input type="date" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="urgency" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2"><Zap className="w-4 h-4 text-accent" />{t("employer.urgency")}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="low">{t("employer.urgencyLow")}</SelectItem>
                              <SelectItem value="normal">{t("employer.urgencyNormal")}</SelectItem>
                              <SelectItem value="high">{t("employer.urgencyHigh")}</SelectItem>
                              <SelectItem value="urgent">{t("employer.urgencyUrgent")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={form.control} name="work_location" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><MapPin className="w-4 h-4 text-accent" />{t("employer.workLocation")}</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder={t("employer.workLocationPh")} /></SelectTrigger></FormControl>
                          <SelectContent>{workLocations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="preferred_contact" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-accent" />{t("employer.preferredContact")}</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4 pt-1">
                            <div className="flex items-center gap-2 rounded-lg border border-border p-3 flex-1">
                              <RadioGroupItem value="phone" id="emp-phone" />
                              <Label htmlFor="emp-phone">{t("employer.contactPhone")}</Label>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg border border-border p-3 flex-1">
                              <RadioGroupItem value="email" id="emp-email" />
                              <Label htmlFor="emp-email">{t("employer.contactEmail")}</Label>
                            </div>
                            <div className="flex items-center gap-2 rounded-lg border border-border p-3 flex-1">
                              <RadioGroupItem value="either" id="emp-either" />
                              <Label htmlFor="emp-either">{t("employer.contactEither")}</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="comments" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-accent" />{t("employer.comments")}</FormLabel>
                        <FormControl><Textarea rows={4} placeholder={t("employer.commentsPh")} {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4">
                  {step > 1 ? (
                    <Button type="button" variant="outline" onClick={prevStep} className="rounded-full px-6">
                      <ChevronLeft className="w-4 h-4 mr-1" /> {t("employer.previous")}
                    </Button>
                  ) : <div />}

                  {step < 3 ? (
                    <Button type="button" onClick={nextStep} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
                      {t("employer.next")} <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={loading} className="bg-accent hover:bg-orange-hover text-accent-foreground font-heading font-bold text-base rounded-full py-6 px-8 shadow-lg hover:shadow-xl transition-all duration-200">
                      <Send className="w-5 h-5 mr-2" />
                      {loading ? t("common.loading") : t("employer.submit")}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployerForm;
