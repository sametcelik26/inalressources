import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import SeekerDashboard from "@/components/dashboard/SeekerDashboard";
import EmployerDashboard from "@/components/dashboard/EmployerDashboard";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import Layout from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";

const Dashboard = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && !user) navigate("/auth");
  }, [loading, user, navigate]);

  if (loading) return <Layout><div className="container mx-auto px-4 py-12 text-center text-muted-foreground">{t("common.loading")}</div></Layout>;
  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {role === "job_seeker" && <SeekerDashboard />}
        {role === "employer" && <EmployerDashboard />}
        {role === "admin" && <AdminDashboard />}
        {!role && <div className="text-center py-12 text-muted-foreground">{t("common.loading")}</div>}
      </div>
    </Layout>
  );
};

export default Dashboard;
