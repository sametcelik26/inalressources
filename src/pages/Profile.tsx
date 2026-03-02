import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { User, Save } from "lucide-react";
import Layout from "@/components/Layout";

const Profile = () => {
  const { user, role, profile, loading, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "", phone: "", bio: "", education: "",
    experience_years: "", skills: "",
    company_name: "", company_description: "", company_website: "", industry: "",
  });

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user]);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        education: profile.education || "",
        experience_years: profile.experience_years?.toString() || "",
        skills: profile.skills?.join(", ") || "",
        company_name: profile.company_name || "",
        company_description: profile.company_description || "",
        company_website: profile.company_website || "",
        industry: profile.industry || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const updateData: any = {
      full_name: form.full_name || null,
      phone: form.phone || null,
    };
    if (role === "job_seeker") {
      updateData.bio = form.bio || null;
      updateData.education = form.education || null;
      updateData.experience_years = form.experience_years ? Number(form.experience_years) : null;
      updateData.skills = form.skills ? form.skills.split(",").map((s) => s.trim()).filter(Boolean) : null;
    }
    if (role === "employer") {
      updateData.company_name = form.company_name || null;
      updateData.company_description = form.company_description || null;
      updateData.company_website = form.company_website || null;
      updateData.industry = form.industry || null;
    }
    const { error } = await supabase.from("profiles").update(updateData).eq("user_id", user.id);
    if (error) {
      toast({ title: t("auth.error"), description: error.message, variant: "destructive" });
    } else {
      await refreshProfile();
      toast({ title: t("profile.saved") });
    }
    setSaving(false);
  };

  if (loading) return <Layout><div className="container mx-auto px-4 py-12 text-center text-muted-foreground">{t("common.loading")}</div></Layout>;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <User className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">{t("profile.title")}</h1>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <Input placeholder={t("profile.fullName")} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} maxLength={100} />
          <Input placeholder={t("profile.phone")} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={20} />

          {role === "job_seeker" && (
            <>
              <Textarea placeholder={t("profile.bio")} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} maxLength={1000} />
              <Input placeholder={t("profile.education")} value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} maxLength={200} />
              <Input placeholder={t("profile.experienceYears")} type="number" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} />
              <Input placeholder={t("profile.skillsComma")} value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} maxLength={500} />
            </>
          )}

          {role === "employer" && (
            <>
              <Input placeholder={t("profile.companyName")} value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} maxLength={200} />
              <Textarea placeholder={t("profile.companyDescription")} value={form.company_description} onChange={(e) => setForm({ ...form, company_description: e.target.value })} rows={3} maxLength={2000} />
              <Input placeholder={t("profile.companyWebsite")} value={form.company_website} onChange={(e) => setForm({ ...form, company_website: e.target.value })} maxLength={255} />
              <Input placeholder={t("profile.industry")} value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} maxLength={100} />
            </>
          )}

          <Button onClick={handleSave} disabled={saving} className="rounded-full bg-accent hover:bg-orange-hover text-accent-foreground font-heading font-bold">
            <Save className="w-4 h-4 mr-2" /> {saving ? "..." : t("profile.save")}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
