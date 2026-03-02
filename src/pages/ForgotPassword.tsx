import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: t("auth.error"), description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-xl shadow-lg p-8 border border-border">
        <Link to="/auth" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> {t("auth.backToLogin")}
        </Link>
        <h1 className="text-xl font-heading font-bold text-foreground mb-2">{t("auth.resetPassword")}</h1>
        {sent ? (
          <p className="text-sm text-muted-foreground">{t("auth.resetEmailSent")}</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="email" placeholder={t("auth.email")} value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required maxLength={255} />
            </div>
            <Button type="submit" className="w-full rounded-full bg-accent hover:bg-orange-hover text-accent-foreground font-heading font-bold" disabled={submitting}>
              {submitting ? "..." : t("auth.sendResetLink")}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
