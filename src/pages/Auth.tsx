import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, Building2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole>("job_seeker");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { signUp, signIn } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast({ title: t("auth.loginSuccess") });
        navigate("/dashboard");
      } else {
        const { error } = await signUp(email, password, fullName, selectedRole);
        if (error) throw error;
        toast({ title: t("auth.signupSuccess"), description: t("auth.checkEmail") });
      }
    } catch (err: any) {
      toast({ title: t("auth.error"), description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-heading font-bold text-xl">IR</span>
            </div>
            <span className="font-heading font-bold text-primary text-2xl">Inal Resources</span>
          </Link>
        </div>

        <div className="bg-card rounded-xl shadow-lg p-8 border border-border">
          <div className="flex mb-6 bg-secondary rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-heading font-semibold rounded-md transition-all ${
                isLogin ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t("auth.login")}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-heading font-semibold rounded-md transition-all ${
                !isLogin ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t("auth.signup")}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t("auth.fullName")}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    required
                    maxLength={100}
                  />
                </div>
                <div>
                  <label className="text-sm font-heading font-medium text-foreground mb-2 block">
                    {t("auth.iAm")}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRole("job_seeker")}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        selectedRole === "job_seeker"
                          ? "border-accent bg-accent/5 text-accent"
                          : "border-border text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      <User className="w-5 h-5" />
                      <span className="text-sm font-heading font-semibold">{t("auth.jobSeeker")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole("employer")}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        selectedRole === "employer"
                          ? "border-accent bg-accent/5 text-accent"
                          : "border-border text-muted-foreground hover:border-primary/30"
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                      <span className="text-sm font-heading font-semibold">{t("auth.employer")}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder={t("auth.email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                maxLength={255}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={t("auth.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {isLogin && (
              <div className="text-right">
                <Link to="/forgot-password" className="text-sm text-accent hover:underline font-body">
                  {t("auth.forgotPassword")}
                </Link>
              </div>
            )}
            <Button type="submit" className="w-full rounded-full bg-accent hover:bg-orange-hover text-accent-foreground font-heading font-bold" disabled={submitting}>
              {submitting ? "..." : isLogin ? t("auth.login") : t("auth.signup")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
