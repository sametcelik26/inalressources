import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { industries } from "@/lib/constants";
import { Building2, User, MapPin, Phone, Mail, Briefcase, Factory, Users, MessageSquare, CheckCircle, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const EmployerForm = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Zod schema with localized error messages via t()
  const employerSchema = z.object({
    company_name: z.string().trim().min(1, t("common.required")).max(200),
    contact_person: z.string().trim().min(1, t("common.required")).max(200),
    company_address: z.string().trim().max(500).optional().or(z.literal("")),
    phone: z.string().trim().max(30).optional().or(z.literal("")),
    email: z.string().trim().email(t("common.invalidEmail")).max(255),
    job_title: z.string().trim().max(200).optional().or(z.literal("")),
    industry: z.string().optional().or(z.literal("")),
    employees_needed: z.coerce.number().int().min(1).max(9999).optional().or(z.literal("")),
    preferred_contact: z.string().default("either"),
    comments: z.string().trim().max(2000).optional().or(z.literal("")),
  });

  type EmployerFormValues = z.infer<typeof employerSchema>;

  const form = useForm<EmployerFormValues>({
    resolver: zodResolver(employerSchema),
    defaultValues: {
      company_name: "", contact_person: "", company_address: "",
      phone: "", email: "", job_title: "", industry: "",
      employees_needed: "", preferred_contact: "either", comments: "",
    },
  });

  const onSubmit = async (data: EmployerFormValues) => {
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
    });
    setLoading(false);
    if (error) {
      toast({ title: t("employer.errorTitle"), description: t("employer.errorDesc"), variant: "destructive" });
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <Layout mainClassName="bg-secondary">
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="bg-card rounded-2xl shadow-xl p-10 max-w-lg w-full text-center">
            <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">{t("employer.successTitle")}</h2>
            <p className="text-muted-foreground mb-6">{t("employer.successDesc")}</p>
            <Button
              onClick={() => { setSubmitted(false); form.reset(); }}
              className="bg-accent hover:bg-orange-hover text-accent-foreground font-heading font-bold rounded-full px-8"
            >
              {t("employer.submitAnother")}
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
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-foreground">{t("employer.formTitle")}</h1>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField control={form.control} name="company_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Building2 className="w-4 h-4 text-accent" />{t("employer.companyName")} *</FormLabel>
                    <FormControl><Input placeholder={t("employer.companyNamePh")} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="contact_person" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><User className="w-4 h-4 text-accent" />{t("employer.contactPerson")} *</FormLabel>
                    <FormControl><Input placeholder={t("employer.contactPersonPh")} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

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

                <FormField control={form.control} name="job_title" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-accent" />{t("employer.jobTitle")}</FormLabel>
                    <FormControl><Input placeholder={t("employer.jobTitlePh")} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

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

                <FormField control={form.control} name="employees_needed" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Users className="w-4 h-4 text-accent" />{t("employer.employeesNeeded")}</FormLabel>
                    <FormControl><Input type="number" min={1} placeholder="e.g. 5" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="preferred_contact" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-accent" />{t("employer.preferredContact")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="phone">{t("employer.contactPhone")}</SelectItem>
                        <SelectItem value="email">{t("employer.contactEmail")}</SelectItem>
                        <SelectItem value="either">{t("employer.contactEither")}</SelectItem>
                      </SelectContent>
                    </Select>
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

                <Button type="submit" disabled={loading} className="w-full bg-accent hover:bg-orange-hover text-accent-foreground font-heading font-bold text-base rounded-full py-6 shadow-lg hover:shadow-xl transition-all duration-200">
                  <Send className="w-5 h-5 mr-2" />
                  {loading ? t("common.loading") : t("employer.submit")}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployerForm;
