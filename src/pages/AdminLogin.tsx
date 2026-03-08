import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail, Shield, Eye, EyeOff } from "lucide-react";
import Layout from "@/components/Layout";

const AdminLogin = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast({ title: t("admin.error"), description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    // Verify admin role server-side (supports users with multiple roles)
    const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
      _user_id: data.user.id,
      _role: "admin",
    });

    if (roleError || !isAdmin) {
      await supabase.auth.signOut();
      toast({ title: t("admin.accessDenied"), description: t("admin.noPrivileges"), variant: "destructive" });
      setLoading(false);
      return;
    }

    toast({ title: t("admin.welcome"), description: t("admin.loggedIn") });
    navigate("/admin/dashboard");
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
              <h1 className="text-2xl font-heading font-bold text-foreground">{t("admin.loginTitle")}</h1>
              <p className="text-muted-foreground text-sm mt-1">{t("admin.loginSubtitle")}</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  {t("admin.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@inalressources.com"
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  {t("admin.password")}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-bold"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminLogin;
