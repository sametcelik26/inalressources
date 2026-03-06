import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";

const contactSchema = z.object({
  name: z.string().trim().min(1, "required").max(100),
  email: z.string().trim().email("invalidEmail").max(255),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  subject: z.string().min(1, "required"),
  message: z.string().trim().min(1, "required").max(2000)
});

type ContactForm = z.infer<typeof contactSchema>;

const Contact = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" }
  });

  const subjectOptions = [
  { value: "general", label: t("contact.subjectGeneral") },
  { value: "recruitment", label: t("contact.subjectRecruitment") },
  { value: "partnership", label: t("contact.subjectPartnership") },
  { value: "support", label: t("contact.subjectSupport") },
  { value: "other", label: t("contact.subjectOther") }];


  const onSubmit = async (data: ContactForm) => {
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject,
      message: data.message
    });
    setLoading(false);

    if (error) {
      toast({ title: t("contact.errorTitle"), description: t("contact.errorDesc"), variant: "destructive" });
    } else {
      setSubmitted(true);
      reset();
    }
  };

  return (
    <Layout>
      {/* Header */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary-foreground mb-3">
            {t("contact.title")}
          </h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto">
            {t("contact.subtitle")}
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-10">
            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-card rounded-xl shadow-lg p-8 border border-border">
                <h2 className="text-xl font-heading font-bold text-foreground mb-6">
                  {t("contact.formTitle")}
                </h2>

                {submitted ?
                <div className="flex flex-col items-center py-12 text-center gap-4">
                    <CheckCircle className="w-16 h-16 text-accent" />
                    <h3 className="text-lg font-heading font-semibold text-foreground">
                      {t("contact.successTitle")}
                    </h3>
                    <p className="text-muted-foreground max-w-sm">
                      {t("contact.successDesc")}
                    </p>
                    <Button variant="outline" onClick={() => setSubmitted(false)} className="mt-2">
                      {t("contact.sendAnother")}
                    </Button>
                  </div> :

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label htmlFor="name">{t("contact.name")} *</Label>
                        <Input id="name" {...register("name")} placeholder={t("contact.namePlaceholder")} />
                        {errors.name && <p className="text-xs text-destructive">{t("contact.fieldRequired")}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email">{t("contact.email")} *</Label>
                        <Input id="email" type="email" {...register("email")} placeholder={t("contact.emailPlaceholder")} />
                        {errors.email &&
                      <p className="text-xs text-destructive">
                            {errors.email.message === "invalidEmail" ? t("contact.invalidEmail") : t("contact.fieldRequired")}
                          </p>
                      }
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">{t("contact.phone")}</Label>
                        <Input id="phone" {...register("phone")} placeholder={t("contact.phonePlaceholder")} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>{t("contact.subject")} *</Label>
                        <Select onValueChange={(v) => setValue("subject", v)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t("contact.subjectPlaceholder")} />
                          </SelectTrigger>
                          <SelectContent>
                            {subjectOptions.map((o) =>
                          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                          )}
                          </SelectContent>
                        </Select>
                        {errors.subject && <p className="text-xs text-destructive">{t("contact.fieldRequired")}</p>}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="message">{t("contact.message")} *</Label>
                      <Textarea
                      id="message"
                      rows={5}
                      {...register("message")}
                      placeholder={t("contact.messagePlaceholder")} />
                    
                      {errors.message && <p className="text-xs text-destructive">{t("contact.fieldRequired")}</p>}
                    </div>

                    <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-[hsl(var(--orange-hover))]">
                      <Send className="w-4 h-4 mr-2" />
                      {loading ? t("common.loading") : t("contact.send")}
                    </Button>
                  </form>
                }
              </div>
            </div>

            {/* Info sidebar */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-xl shadow-lg p-8 border border-border space-y-6">
                <h2 className="text-xl font-heading font-bold text-foreground">
                  {t("contact.infoTitle")}
                </h2>

                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="font-heading font-semibold text-sm text-foreground">{t("contact.addressLabel")}</p>
                    <p className="text-sm text-muted-foreground">3901, Avenue Bannantyne, Bureaux 204 et 210

Verdun (Québec) H4G 1C2</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="font-heading font-semibold text-sm text-foreground">{t("contact.phoneLabel")}</p>
                    <p className="text-sm text-muted-foreground">+1 (438) 000-0000</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="font-heading font-semibold text-sm text-foreground">{t("contact.emailLabel")}</p>
                    <p className="text-sm text-muted-foreground">info@inalresources.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                  <div>
                    <p className="font-heading font-semibold text-sm text-foreground">{t("contact.hoursLabel")}</p>
                    <p className="text-sm text-muted-foreground">{t("footer.weekdays")}</p>
                    <p className="text-sm text-muted-foreground">{t("footer.weekend")}</p>
                  </div>
                </div>
              </div>

              {/* Google Maps */}
              <div className="rounded-xl overflow-hidden shadow-lg border border-border">
                <iframe title="Inal Resources - Laval, QC" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d89217.47362070877!2d-73.78844685!3d45.5844906!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4cc923a4f2db3d61%3A0x5040cadae4d7580!2sLaval%2C%20QC!5e0!3m2!1sen!2sca!4v1700000000000"
                  width="100%"
                  height="280"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade" />
                
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>);

};

export default Contact;