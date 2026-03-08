import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Shield, ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";

const ADMIN_USERNAME = "inal";
const ADMIN_EMAIL = "info@inalressources.com";

const AdminForgotPassword = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (username.toLowerCase() !== ADMIN_USERNAME) {
      toast({ title: t("admin.error"), description: t("admin.invalidUsername"), variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(ADMIN_EMAIL, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });

    if (error) {
      toast({ title: t("admin.error"), description: error.message, variant: "destructive" });
    } else {
      setSent(true);
      toast({ title: t("admin.resetSent"), description: t("admin.resetSentDesc") });
    }

    setLoading(false);
  };

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-heading font-bold text-foreground">{t("admin.resetTitle")}</h1>
              <p className="text-muted-foreground text-sm mt-1">{t("admin.resetSubtitle")}</p>
            </div>

            {sent ? (
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">{t("admin.resetSentDesc")}</p>
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {t("admin.backToLogin")}
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="username" className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    {t("admin.username")}
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="inal"
                    required
                    className="h-11"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold"
                >
                  {loading ? t("admin.sending") : t("admin.sendResetLink")}
                </Button>

                <div className="text-center">
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    {t("admin.backToLogin")}
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminForgotPassword;
