import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import TopBar from "@/components/TopBar";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { User, Phone, Mail, Clock, Car, Factory, MapPin, Shield, Upload, MessageSquare, CheckCircle, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const candidateSchema = z.object({
  full_name: z.string().trim().max(200).optional().or(z.literal("")),
  phone: z.string().trim().min(1, "Required").max(30),
  email: z.string().trim().email("Invalid email").max(255),
  availability: z.string().optional().or(z.literal("")),
  license_class: z.string().min(1, "Required"),
  industry: z.string().min(1, "Required"),
  work_location: z.string().min(1, "Required"),
  legal_right_to_work: z.string().optional(),
  preferred_contact: z.string().min(1, "Required"),
  comments: z.string().trim().max(2000).optional().or(z.literal("")),
});

type CandidateFormValues = z.infer<typeof candidateSchema>;

const licenseClasses = ["None", "Class 5 (G)", "Class 4 (G2)", "Class 3 (DZ)", "Class 2 (CZ)", "Class 1 (AZ)", "Other"];
const industries = [
  "Construction", "Manufacturing", "Warehousing & Logistics",
  "Hospitality & Food Services", "Retail", "Healthcare",
  "Information Technology", "Finance & Banking", "Education",
  "Transportation", "Agriculture", "Mining & Resources",
  "Real Estate", "Telecommunications", "Energy & Utilities", "Other",
];
const locations = [
  "Montreal", "Laval", "Quebec City", "Gatineau", "Sherbrooke",
  "Longueuil", "Trois-Rivières", "Saguenay", "Lévis", "Terrebonne",
  "Toronto", "Ottawa", "Vancouver", "Calgary", "Edmonton", "Other",
];

const CandidateForm = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      full_name: "", phone: "", email: "", availability: "",
      license_class: "", industry: "", work_location: "",
      legal_right_to_work: "no", preferred_contact: "either", comments: "",
    },
  });

  const onSubmit = async (data: CandidateFormValues) => {
    setLoading(true);
    let cv_url: string | null = null;

    if (cvFile) {
      const ext = cvFile.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("candidate-cvs").upload(path, cvFile);
      if (uploadError) {
        toast({ title: t("candidate.errorTitle"), description: t("candidate.uploadError"), variant: "destructive" });
        setLoading(false);
        return;
      }
      cv_url = path;
    }

    const { error } = await supabase.from("candidate_applications").insert({
      full_name: data.full_name || "N/A",
      phone: data.phone,
      email: data.email,
      availability: data.availability || null,
      license_class: data.license_class,
      industry: data.industry,
      work_location: data.work_location,
      legal_right_to_work: data.legal_right_to_work === "yes",
      cv_url,
      preferred_contact: data.preferred_contact,
      comments: data.comments || null,
    });
    setLoading(false);
    if (error) {
      toast({ title: t("candidate.errorTitle"), description: t("candidate.errorDesc"), variant: "destructive" });
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar /><NavBar />
        <main className="flex-1 flex items-center justify-center bg-secondary px-4 py-16">
          <div className="bg-card rounded-2xl shadow-xl p-10 max-w-lg w-full text-center">
            <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">{t("candidate.successTitle")}</h2>
            <p className="text-muted-foreground mb-6">{t("candidate.successDesc")}</p>
            <Button onClick={() => { setSubmitted(false); form.reset(); setCvFile(null); }} className="bg-accent hover:bg-orange-hover text-accent-foreground font-heading font-bold rounded-full px-8">
              {t("candidate.submitAnother")}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar /><NavBar />
      <main className="flex-1 bg-secondary px-4 py-12">
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

                <FormField control={form.control} name="availability" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Clock className="w-4 h-4 text-accent" />{t("candidate.availability")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder={t("candidate.availabilityPh")} /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="full_time">{t("candidate.fullTime")}</SelectItem>
                        <SelectItem value="part_time">{t("candidate.partTime")}</SelectItem>
                        <SelectItem value="temporary">{t("candidate.temporary")}</SelectItem>
                      </SelectContent>
                    </Select>
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

                <FormField control={form.control} name="industry" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Factory className="w-4 h-4 text-accent" />{t("candidate.industry")} *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder={t("candidate.industryPh")} /></SelectTrigger></FormControl>
                      <SelectContent>{industries.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="work_location" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><MapPin className="w-4 h-4 text-accent" />{t("candidate.workLocation")} *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder={t("candidate.workLocationPh")} /></SelectTrigger></FormControl>
                      <SelectContent>{locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                    </Select>
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
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-accent transition-colors"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {cvFile ? cvFile.name : t("candidate.uploadCvPh")}
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    />
                  </div>
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
      </main>
      <Footer />
    </div>
  );
};

export default CandidateForm;
